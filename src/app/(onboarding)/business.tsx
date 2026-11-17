import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';
import { imageErrorCopy, pickImage } from '@/lib/image';
import { formatPhoneDisplay, toE164 } from '@/lib/phone';
import { colors, radius, spacing } from '@/theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function BusinessProfileScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const [businessName, setBusinessName] = useState(draft.businessName);
  const [whatsapp, setWhatsapp] = useState(draft.whatsappInput);
  const [phone, setPhone] = useState(draft.phoneInput);
  const [email, setEmail] = useState(draft.email);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(draft.logoUrl);

  const [showMore, setShowMore] = useState(false);
  const [address, setAddress] = useState(draft.address);
  const [instagram, setInstagram] = useState(draft.instagram);
  const [facebook, setFacebook] = useState(draft.facebook);
  const [tiktok, setTiktok] = useState(draft.tiktok);
  const [registrationInfo, setRegistrationInfo] = useState(draft.registrationInfo);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const whatsappE164 = toE164(whatsapp);
  const phoneE164 = phone.trim() ? toE164(phone) : null;

  async function chooseLogo() {
    setImageError(null);
    setImageBusy(true);
    try {
      const picked = await pickImage({ maxWidth: 512, aspect: [1, 1] });
      if (picked) setLogoUrl(picked.uri);
    } catch (caught) {
      setImageError(
        caught instanceof Error && caught.message === 'permission_denied'
          ? imageErrorCopy.permission_denied
          : imageErrorCopy.unknown,
      );
    } finally {
      setImageBusy(false);
    }
  }

  function next() {
    const phoneInvalid = phone.trim().length > 0 && !phoneE164;
    const nextErrors = {
      businessName: businessName.trim().length < 2 ? 'Enter your business or brand name' : undefined,
      whatsapp: whatsappE164 ? undefined : 'Enter a valid number, e.g. 0803 123 4567',
      phone: phoneInvalid ? 'Enter a valid phone number or leave it empty' : undefined,
      email: email.trim().length > 0 && !EMAIL_PATTERN.test(email.trim()) ? 'Enter a valid email address' : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    update({
      businessName: businessName.trim(),
      whatsappInput: whatsappE164 ?? whatsapp,
      phoneInput: phoneE164 ?? '',
      email: email.trim(),
      logoUrl,
      address: address.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim(),
      tiktok: tiktok.trim(),
      registrationInfo: registrationInfo.trim(),
    });
    router.push('/unit-and-template');
  }

  return (
    <Screen contentStyle={styles.content}>
      <Stepper step={2} />

      <View style={styles.headline}>
        <AppText variant="h1">Your business</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          This is what your customers see when you message them.
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={logoUrl ? 'Change business logo' : 'Add business logo'}
        onPress={chooseLogo}
        style={styles.logoRow}
      >
        <View style={styles.logoBox}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoImage} contentFit="cover" />
          ) : (
            <AppText variant="caption" color={colors.inkSubtle} center>
              Add{'\n'}logo
            </AppText>
          )}
          {imageBusy ? (
            <View style={styles.logoOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </View>
        <View style={styles.logoCopy}>
          <AppText variant="label">{logoUrl ? 'Change logo' : 'Business logo'}</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            Square image, compressed automatically. Optional.
          </AppText>
          {logoUrl ? (
            <Pressable accessibilityRole="button" onPress={() => setLogoUrl(undefined)}>
              <AppText variant="caption" color={colors.danger}>
                Remove
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </Pressable>

      {imageError ? (
        <View style={styles.errorBanner}>
          <AppText variant="caption" color={colors.danger}>
            {imageError}
          </AppText>
        </View>
      ) : null}

      <View style={styles.form}>
        <TextField
          label="Business or brand name"
          value={businessName}
          onChangeText={(text) => {
            setBusinessName(text);
            if (errors.businessName) setErrors({ ...errors, businessName: undefined });
          }}
          placeholder="Adaeze Couture"
          autoComplete="organization"
          error={errors.businessName}
        />

        <TextField
          label="WhatsApp number"
          value={whatsapp}
          onChangeText={(text) => {
            setWhatsapp(text);
            if (errors.whatsapp) setErrors({ ...errors, whatsapp: undefined });
          }}
          placeholder="0803 123 4567"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          error={errors.whatsapp}
          helper={
            whatsappE164 ? `Saved as ${formatPhoneDisplay(whatsappE164)}` : 'The number your customers message you on.'
          }
        />

        <TextField
          label="Phone number (optional)"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
          placeholder="0803 123 4567"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <TextField
          label="Email (optional)"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          error={errors.email}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showMore }}
          onPress={() => setShowMore((value) => !value)}
        >
          <AppText variant="label" color={colors.primary}>
            {showMore ? '− Hide extra details' : '+ Add extra details (optional)'}
          </AppText>
        </Pressable>

        {showMore ? (
          <View style={styles.moreBlock}>
            <TextField
              label="Business address"
              value={address}
              onChangeText={setAddress}
              placeholder="Lekki Phase 1, Lagos"
            />
            <TextField
              label="Instagram"
              value={instagram}
              onChangeText={setInstagram}
              placeholder="@yourbrand"
              autoCapitalize="none"
            />
            <TextField label="Facebook" value={facebook} onChangeText={setFacebook} placeholder="Your page name" autoCapitalize="none" />
            <TextField label="TikTok" value={tiktok} onChangeText={setTiktok} placeholder="@yourbrand" autoCapitalize="none" />
            <TextField
              label="Business registration (optional)"
              value={registrationInfo}
              onChangeText={setRegistrationInfo}
              placeholder="RC number, if registered"
              helper="Registered and unregistered businesses are both welcome."
            />
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label="Continue" onPress={next} />
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <AppText variant="label" color={colors.inkMuted} center>
            Back
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.lg },
  headline: { gap: spacing.xs },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 72 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: { width: 72, height: 72 },
  logoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251,249,246,0.7)',
  },
  logoCopy: { flex: 1, gap: spacing.xxs },
  errorBanner: { backgroundColor: colors.dangerSoft, borderRadius: radius.sm, padding: spacing.md },
  form: { gap: spacing.lg },
  moreBlock: { gap: spacing.lg },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});



