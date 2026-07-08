import { API_ROUTES } from "@/constants/ApiRoutes";
import { Theme } from "@/constants/Theme";
import { api } from "@/lib/axios/axios";
import { tokenManager } from "@/lib/axios/tokenManager";
import { ErrorResponse } from "@/lib/types/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TextInput, ActivityIndicator, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { LoginSalesmanParams, salesmanType } from "@/shared/zod";
import { storageManager } from "@/lib/asyncStorage/asnycStoreMannager";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const getDeviceDetails = async () => {
  return {
    deviceId: Device.osInternalBuildId ?? Device.deviceName ?? "unknown-device",
    osName: Device.osName ?? "unknown-os",
    osVersion: Device.osVersion ?? "unknown-version",
    manufacturer: Device.manufacturer ?? "unknown-manufacturer",
    modelName: Device.modelName ?? "unknown-model",
    appVersion: Application.nativeApplicationVersion ?? "unknown",
    buildVersion: Application.nativeBuildVersion ?? "unknown",
  };
};

const ROLES = [
  { value: "FIELDEXECUTIVE", label: "Field Executive", icon: "people-outline" },
  { value: "VANSALES", label: "Van Sales", icon: "car-outline" },
  { value: "SUPERVISOR", label: "Supervisor", icon: "shield-checkmark-outline" },
  { value: "CITYHEAD", label: "City Head", icon: "business-outline" },
  { value: "MERCHANDISER", label: "Merchandiser", icon: "pricetag-outline" },
  { value: "ASM", label: "Area Sales Manager", icon: "ribbon-outline" },
  { value: "OFFICE", label: "Office Staff", icon: "desktop-outline" },
  { value: "TERRITORY_SALES_MANAGER", label: "TSM", icon: "map-outline" },
  { value: "DRIVER", label: "Driver", icon: "navigate-outline" },
  { value: "FACTORY", label: "Factory", icon: "construct-outline" }
] as const;

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<salesmanType>("FIELDEXECUTIVE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<'select-role' | 'credentials'>('select-role');
  const [secureEntry, setSecureEntry] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadSelectedRole = async () => {
      const storedRole = await storageManager.get<salesmanType>("SELECTED_ROLE");
      if (storedRole) {
        setSelectedRole(storedRole);
      }
    };
    loadSelectedRole();
  }, []);

  const loginMutation = useMutation<any, ErrorResponse, LoginSalesmanParams>({
    mutationFn: async (loginData: LoginSalesmanParams) => {
      const res = await api.post(API_ROUTES.AUTH.LOGIN, loginData);
      return res.data;
    },
    onSuccess: async (data: any) => {
      setError("");
      if (data?.data?.token) {
        // Set token temporarily to verify role
        await tokenManager.setToken(data?.data?.token);
        await tokenManager.setRefreshToken(data?.data?.refresh);

        try {
          // Fetch details to check if role matches
          const userRes = await api.get(API_ROUTES.AUTH.ME);
          const userRole = userRes.data?.data?.salesmanType;

          if (userRole !== selectedRole) {
            // Mismatch! Discard session and return error
            await tokenManager.clearToken();
            setError("Invalid password/role/email/number");
            return;
          }

          // Match! Complete login
          await storageManager.set("SELECTED_ROLE", selectedRole);
          router.replace("/screens/checkin");
        } catch (err) {
          await tokenManager.clearToken();
          setError("Login verification failed. Please try again.");
        }
      } else {
        setError("No token returned from login response");
      }
    },
    onError: (error: ErrorResponse) => {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const deviceDetails = await getDeviceDetails();
    const loginData: LoginSalesmanParams = {
      email,
      password,
      deviceId: deviceDetails.deviceId,
      osName: deviceDetails.osName,
      osVersion: deviceDetails.osVersion,
      manufacturer: deviceDetails.manufacturer,
      modelName: deviceDetails.modelName,
      appVersion: deviceDetails.appVersion,
      buildVersion: deviceDetails.buildVersion
    };

    loginMutation.mutate(loginData);
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header Gradient background */}
        <LinearGradient
          colors={Theme.colors.gradients.primary}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.appIdentity}>
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={styles.logoImage} 
                />
              </View>
              <Text style={styles.appName}>NexForce</Text>
              <Text style={styles.appSubtitle}>Smart Sales Execution Platform</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content Container (Card styling) */}
        <View style={styles.formCard}>
          {step === 'select-role' ? (
            <>
              <Text style={styles.welcomeText}>Select Your Role</Text>
              <Text style={styles.instructionText}>Choose your role below to access the NexForce platform</Text>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Role Selection Grid */}
                <View style={styles.roleGrid}>
                  {ROLES.map((role) => {
                    const isActive = selectedRole === role.value;
                    return (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleGridItem,
                          isActive && styles.roleGridItemActive
                        ]}
                        onPress={() => {
                          setSelectedRole(role.value);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={role.icon}
                          size={15}
                          color={isActive ? "#FFFFFF" : Theme.colors.text.secondary}
                        />
                        <Text style={[
                          styles.roleGridItemText,
                          isActive && styles.roleGridItemTextActive
                        ]} numberOfLines={1}>
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Continue button */}
                <TouchableOpacity
                  onPress={() => setStep('credentials')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={Theme.colors.gradients.primary}
                    style={styles.loginButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.loginButtonText}>Continue for Login</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Back button to choose roles step */}
              <TouchableOpacity
                onPress={() => {
                  setError("");
                  setStep('select-role');
                }}
                style={styles.backButtonRoles}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back-outline" size={16} color={Theme.colors.primary} />
                <Text style={styles.backButtonRolesText}>Change Role</Text>
              </TouchableOpacity>

              <Text style={styles.welcomeText}>Login as {ROLES.find(r => r.value === selectedRole)?.label}</Text>
              <Text style={styles.instructionText}>Enter your credentials to continue</Text>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <Text style={styles.inputLabel}>Mobile / Email</Text>
                <View style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={emailFocused ? Theme.colors.primary : Theme.colors.text.muted} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Enter mobile number"
                    placeholderTextColor={Theme.colors.text.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    style={styles.input}
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                {/* Password Input */}
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={passwordFocused ? Theme.colors.primary : Theme.colors.text.muted} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Enter password"
                    placeholderTextColor={Theme.colors.text.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureEntry}
                    style={styles.input}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureEntry(!secureEntry)}
                    style={styles.visibilityToggle}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={secureEntry ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={Theme.colors.text.muted}
                    />
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={Theme.colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loginMutation.status === "pending"}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={Theme.colors.gradients.primary}
                    style={[
                      styles.loginButton,
                      loginMutation.status === "pending" && styles.loginButtonDisabled
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loginMutation.status === "pending" ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version v{Application.nativeApplicationVersion || '1.0.0'} ({Application.nativeBuildVersion || '1'})
          </Text>
          <Text style={styles.deviceText}>
            Device: {Device.manufacturer} {Device.modelName}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    height: 280,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  headerSafeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appIdentity: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...Theme.shadows.md,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  appName: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h1,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -30,
    padding: 24,
    ...Theme.shadows.lg,
  },
  backButtonRoles: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 4,
  },
  backButtonRolesText: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.primary,
  },
  welcomeText: {
    fontFamily: Theme.typography.fontFamily.bold,
    fontSize: Theme.typography.sizes.h2,
    color: Theme.colors.text.primary,
    textAlign: "center",
  },
  instructionText: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    columnGap: "4%",
    marginBottom: 12,
  },
  roleGridItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 6,
  },
  roleGridItemActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    ...Theme.shadows.sm,
  },
  roleGridItemText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm - 1,
    color: Theme.colors.text.secondary,
    flex: 1,
  },
  roleGridItemTextActive: {
    color: "#FFFFFF",
    fontFamily: Theme.typography.fontFamily.semiBold,
  },
  inputLabel: {
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: Theme.radius.md,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  inputContainerFocused: {
    borderColor: Theme.colors.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.body,
    color: Theme.colors.text.primary,
  },
  visibilityToggle: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.dangerLight,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.bodySm,
    color: Theme.colors.danger,
    flex: 1,
  },
  loginButton: {
    borderRadius: Theme.radius.md,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    ...Theme.shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: Theme.typography.fontFamily.semiBold,
    fontSize: Theme.typography.sizes.h3,
  },
  footer: {
    alignItems: "center",
    marginVertical: 32,
    gap: 4,
  },
  footerText: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.text.muted,
  },
  deviceText: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.sizes.caption,
    color: Theme.colors.text.muted,
  },
});