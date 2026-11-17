import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Compress before upload (design doc C2): max width 512 for logos, 800 for photos,
 * 70% JPEG → ~40–120 KB. Never upload the raw camera file.
 */
export async function compressImage(uri: string, maxWidth: number): Promise<PickedImage> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: maxWidth });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

export async function pickImage(options?: {
  maxWidth?: number;
  aspect?: [number, number];
  allowsEditing?: boolean;
}): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) return null;
  return compressImage(result.assets[0].uri, options?.maxWidth ?? 512);
}

export async function takePhoto(options?: { maxWidth?: number }): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 1 });
  if (result.canceled || !result.assets[0]) return null;
  return compressImage(result.assets[0].uri, options?.maxWidth ?? 800);
}

export const imageErrorCopy = {
  permission_denied: 'DIOKS needs access to your photos to add an image. You can enable it in your phone settings.',
  unknown: 'That image could not be added. Please try another one.',
} as const;
