import { baseApi } from "@/store/api/baseApi";
import { auth } from "@/lib/firebase";
import {
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { UserDto } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        loginWithEmail: builder.mutation<UserDto, { email: string; password: string }>({
            queryFn: async ({ email, password }) => {
                if (!auth) return { error: { status: "CUSTOM_ERROR", error: "Authentication is not available." } };
                try {
                    const result = await signInWithEmailAndPassword(auth, email, password);
                    const user = result.user;
                    return {
                        data: {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                        },
                    };
                } catch (error) {
                    const code = (error as { code?: string }).code;
                    const messages: Record<string, string> = {
                        "auth/user-not-found": "No account found with this email.",
                        "auth/wrong-password": "Invalid email or password.",
                        "auth/invalid-credential": "Invalid email or password.",
                        "auth/too-many-requests": "Too many attempts. Please try again later.",
                        "auth/invalid-email": "Invalid email address.",
                    };
                    return { error: { status: "CUSTOM_ERROR", error: messages[code ?? ""] ?? "Login failed." } };
                }
            },
        }),

        registerWithEmail: builder.mutation<UserDto, { email: string; password: string; displayName: string }>({
            queryFn: async ({ email, password, displayName }) => {
                if (!auth) return { error: { status: "CUSTOM_ERROR", error: "Authentication is not available." } };
                try {
                    const result = await createUserWithEmailAndPassword(auth, email, password);
                    await updateProfile(result.user, { displayName });
                    const user = result.user;
                    return {
                        data: {
                            uid: user.uid,
                            email: user.email,
                            displayName,
                            photoURL: user.photoURL,
                        },
                    };
                } catch (error) {
                    const code = (error as { code?: string }).code;
                    const messages: Record<string, string> = {
                        "auth/email-already-in-use": "This email is already registered.",
                        "auth/invalid-email": "Invalid email address.",
                    };
                    const errorMsg = messages[code ?? ""];
                    return { error: { status: "CUSTOM_ERROR", error: errorMsg || String(error) } };
                }
            },
        }),

        logout: builder.mutation<void, void>({
            queryFn: async () => {
                if (!auth) return { error: { status: "CUSTOM_ERROR", error: "Authentication is not available." } };
                try {
                    await signOut(auth);
                    return { data: undefined };
                } catch (error) {
                    return { error: { status: "CUSTOM_ERROR", error: String(error) } };
                }
            },
        }),
    }),
});

export const {
    useLoginWithEmailMutation,
    useRegisterWithEmailMutation,
    useLogoutMutation,
} = authApi;
