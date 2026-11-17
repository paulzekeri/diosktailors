import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError, type Gender } from '@/data';
import {
  EMPTY_CUSTOMER_FORM,
  findDuplicatePhone,
  toNewCustomer,
  validateCustomerForm,
  type CustomerFormValues,
} from '@/features/customers/validation';
import { useCreateCustomer, useCustomers } from '@/features/customers/queries';
import { imageErrorCopy, pickImage } from '@/lib/image';
import type { FieldErrors } from '@/lib/forms';
import { toE164 } from '@/lib/phone';
import { colors, layout, radius, spacing } from '@/theme';

const GENDERS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: 'female', label: 'Woman' },
  { value: 'male', label: 'Man' },
  { value: 'other', label: 'Other' },
];

/**
 * Screen 19 (Â§5): name*, phone* with E.164 preview, WhatsApp, email, gender,
 * birthday, anniversary, photo, notes. Duplicate numbers warn instead of
 * blocking (G-16). "Add measurements next" lands with the measurement screen.
 */
export default function NewCustomerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [values, setValues] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoBusy, setPhotoBusy] = useState(false);

  const create = useCreateCustomer();
  const customers = useCustomers('');
  const duplicate = findDuplicatePhone(customers.data ?? [], values.phone);
  const preview = toE164(values.phone);

  function setField<K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function validateField(key: keyof CustomerFormValues) {
    const result = validateCustomerForm(values);
    setErrors((previous) => ({ ...previous, [key]: result.success ? undefined : result.errors[key] }));
  }

  async function addPhoto() {
    try {
      setPhotoBusy(true);
      const picked = await pickImage({ maxWidth: 512 });
      if (picked) setField('photoUrl', picked.uri);
    } catch (caught) {
      const code = caught instanceof Error && caught.message === 'permission_denied' ? 'permission_denied' : 'unknown';
      toast.show({ message: imageErrorCopy[code], tone: 'danger', duration: 6000 });
    } finally {
      setPhotoBusy(false);
    }
  }

  function submit() {
    const result = validateCustomerForm(values);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    create.mutate(toNewCustomer(result.data), {
      onSuccess: (customer) => {
        toast.show({ message: `${customer.fullName.split(' ')[0]} added to your book`, tone: 'success' });
        router.replace(`/customers/${customer.id}` as never);
      },
      onError: (error) => {
        toast.show({ message: repositoryErrorCopy[toRepositoryError(error).code], tone: 'danger', duration: 6000 });
      },
    });
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <Wash variant="screen" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="h1">New customer</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                Name and phone are all you need. Measurements come next.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.close}
            >
              <AppText variant="label" weight="semiBold" color={colors.inkMuted}>
                Close
              </AppText>
            </Pressable>
          </View>

          <View style={styles.photoRow}>
            <Avatar name={values.fullName || 'New customer'} uri={values.photoUrl || undefined} size="xl" />
            <View style={styles.photoCopy}>
              <Button
                label={values.photoUrl ? 'Change photo' : 'Add photo'}
                variant="secondary"
                loading={photoBusy}
                fullWidth={false}
                onPress={() => void addPhoto()}
              />
              <AppText variant="caption" color={colors.inkSubtle}>
                Optional · compressed to 512px before saving
              </AppText>
            </View>
          </View>

          <TextField
            label="Full name"
            value={values.fullName}
            onChangeText={(text) => setField('fullName', text)}
            onBlur={() => validateField('fullName')}
            error={errors.fullName}
            placeholder="Bola Adeyemi"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />

          <TextField
            label="Phone number"
            value={values.phone}
            onChangeText={(text) => setField('phone', text)}
            onBlur={() => validateField('phone')}
            error={errors.phone}
            helper={preview ? `Saves as ${preview}` : 'e.g. 0803 123 4567'}
            placeholder="0803 123 4567"
            keyboardType="phone-pad"
            inputMode="tel"
            autoComplete="tel"
          />

          {duplicate ? (
            <AppText variant="caption" color={colors.warning} accessibilityLiveRegion="polite">
              {duplicate.fullName} already uses this number. You can still save — open their profile instead if this is a
              duplicate.
            </AppText>
          ) : null}

          <TextField
            label="WhatsApp number"
            value={values.whatsapp ?? ''}
            onChangeText={(text) => setField('whatsapp', text)}
            onBlur={() => validateField('whatsapp')}
            error={errors.whatsapp}
            helper="Leave empty if it is the same as the phone number"
            placeholder="0803 123 4567"
            keyboardType="phone-pad"
            inputMode="tel"
          />

          <TextField
            label="Email"
            value={values.email ?? ''}
            onChangeText={(text) => setField('email', text)}
            onBlur={() => validateField('email')}
            error={errors.email}
            placeholder="bola@example.com"
            keyboardType="email-address"
            inputMode="email"
            autoCapitalize="none"
            autoComplete="email"
          />

          <View style={styles.fieldGroup}>
            <AppText variant="label" color={colors.inkMuted}>
              Gender
            </AppText>
            <View style={styles.chipRow}>
              {GENDERS.map((option) => {
                const active = values.gender === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={option.label}
                    onPress={() => setField('gender', active ? undefined : option.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <AppText
                      variant="label"
                      weight={active ? 'semiBold' : 'medium'}
                      color={active ? colors.primary : colors.inkMuted}
                    >
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label="Birthday"
            value={values.birthday ?? ''}
            onChangeText={(text) => setField('birthday', text)}
            onBlur={() => validateField('birthday')}
            error={errors.birthday}
            helper="Optional · YYYY-MM-DD, used for birthday reminders"
            placeholder="1990-05-01"
            maxLength={10}
          />

          <TextField
            label="Anniversary"
            value={values.anniversary ?? ''}
            onChangeText={(text) => setField('anniversary', text)}
            onBlur={() => validateField('anniversary')}
            error={errors.anniversary}
            helper="Optional · YYYY-MM-DD"
            placeholder="2018-11-24"
            maxLength={10}
          />

          <TextField
            label="Notes"
            value={values.notes}
            onChangeText={(text) => setField('notes', text)}
            onBlur={() => validateField('notes')}
            error={errors.notes}
            placeholder="Style preferences, fabric notes, anything worth remembering"
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label="Save customer" loading={create.isPending} onPress={submit} />

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl, gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  close: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  photoCopy: { flex: 1, gap: spacing.sm, alignItems: 'flex-start' },
  fieldGroup: { gap: spacing.xs + 2 },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    flex: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceWell,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.canvasDeep,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
