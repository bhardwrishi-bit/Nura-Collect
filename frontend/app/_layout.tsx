import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  useFonts,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { COLORS, SPACING } from '../src/constants/theme';
import { supabase, getCurrentCollector } from '../src/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    'BricolageGrotesque-Regular': BricolageGrotesque_400Regular,
    'BricolageGrotesque-Medium': BricolageGrotesque_500Medium,
    'BricolageGrotesque-SemiBold': BricolageGrotesque_600SemiBold,
    'BricolageGrotesque-Bold': BricolageGrotesque_700Bold,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Verify the authenticated user has an active collectors row
  const verifyCollector = async (s: Session): Promise<boolean> => {
    const { data, error } = await supabase
      .from('collectors')
      .select('id, status')
      .eq('auth_id', s.user.id)
      .single();

    if (error || !data || data.status !== 'active') {
      await supabase.auth.signOut();
      setAccountError('Your account is not active. Contact Kanav.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session ?? null;
      if (s) {
        const ok = await verifyCollector(s);
        if (ok) setSession(s);
      }
      setAuthChecked(true);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (event === 'SIGNED_OUT' || !s) {
          setSession(null);
          setAccountError(null);
          router.replace('/login');
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const ok = await verifyCollector(s);
          if (ok) {
            setSession(s);
            setAccountError(null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Route guard — runs after both fonts and auth are ready
  useEffect(() => {
    if (!fontsLoaded || !authChecked) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const onLogin = segments[0] === 'login';

    if (!session && !onLogin) {
      router.replace('/login');
    } else if (session && onLogin) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, authChecked, session, segments]);

  // Show spinner while fonts load or auth check is pending
  if (!fontsLoaded || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Show account error (no active collectors row)
  if (accountError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{accountError}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
