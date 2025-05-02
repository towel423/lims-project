"use client";

// React Imports
import { useState } from "react";

// Next Imports
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// MUI Imports
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";

// Third-party Imports
import { signIn } from "next-auth/react";
import useLogin from "../hooks/useLogin";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { email, object, minLength, string, pipe, nonEmpty } from "valibot";
import type { SubmitHandler } from "react-hook-form";
import type { InferInput } from "valibot";
import classnames from "classnames";

// Type Imports
import type { SystemMode } from "@core/types";
import type { Locale } from "@/configs/i18n";

// Component Imports
import Logo from "@components/layout/shared/Logo";
import CustomTextField from "@core/components/mui/TextField";

// Config Imports
import themeConfig from "@configs/themeConfig";

// Hook Imports
import { useImageVariant } from "@core/hooks/useImageVariant";
import { useSettings } from "@core/hooks/useSettings";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";


// Styled Custom Components
const LoginIllustration = styled("img")(({ theme }) => ({
  zIndex: 2,
  blockSize: "auto",
  maxBlockSize: 680,
  maxInlineSize: "100%",
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550,
  },
  [theme.breakpoints.down("lg")]: {
    maxBlockSize: 450,
  },
}));

const MaskImg = styled("img")({
  blockSize: "auto",
  maxBlockSize: 355,
  inlineSize: "100%",
  position: "absolute",
  insetBlockEnd: 0,
  zIndex: -1,
});

type ErrorType = {
  message: string[];
};

interface FormData {
  username: string;
  password: string;
}

const schema = object({
  username: pipe(string(), minLength(1, "This field is required")),
  password: pipe(
    string(),
    nonEmpty("This field is required"),
    minLength(5, "Password must be at least 5 characters long")
  ),
});

const Login = ({ mode }: { mode: SystemMode }) => {
  const { login, loading, error } = useLogin();
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [errorState, setErrorState] = useState<ErrorType | null>(null);

  // Vars
  const darkImg = "/images/pages/auth-mask-dark.png";
  const lightImg = "/images/pages/auth-mask-light.png";
  const darkIllustration = "/images/illustrations/auth/v2-login-dark.png";
  const lightIllustration = "/images/illustrations/auth/v2-login-light.png";
  const borderedDarkIllustration =
    "/images/illustrations/auth/v2-login-dark-border.png";
  const borderedLightIllustration =
    "/images/illustrations/auth/v2-login-light-border.png";

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang: locale } = useParams();
  const { settings } = useSettings();
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const authBackground = useImageVariant(mode, lightImg, darkImg);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: "", // Nilai awal untuk username
      password: "", // Nilai awal untuk password
    },
  });

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  );

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);

  const onSubmit: SubmitHandler<FormData> = async data => {
    try {
      const success = await login(data);
      if (success) {
        setSnackbarOpen(true); // Tampilkan Snackbar
        setTimeout(() => {
          const redirectURL = searchParams.get("redirectTo") ?? "/";
          router.replace(getLocalizedUrl(redirectURL, locale as string));
        }, 2000); // Tunggu 2 detik sebelum redirect
      } else {
        setErrorState({ message: ["Invalid username or password"] });
      }
    } catch (error) {
      setErrorState({
        message: ["An unexpected error occurred. Please try again."],
      });
    }
  };
  

  return (
    <div className="flex bs-full justify-center">
      <div
        className={classnames(
          "flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden",
          {
            "border-ie": settings.skin === "bordered",
          }
        )}
      >
        <LoginIllustration
          src={characterIllustration}
          alt="character-illustration"
        />
        {!hidden && <MaskImg alt="mask" src={authBackground} />}
      </div>
      <div className="flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]">
        <div className="absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]">
          <Logo />
        </div>
        <div className="flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0">
          <div className="flex flex-col gap-1">
            <Typography variant="h4">{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>
              Please sign-in to your account and start the adventure
            </Typography>
          </div>
          {/* <Alert
            icon={false}
            className="bg-[var(--mui-palette-primary-lightOpacity)]"
          >
            <Typography variant="body2" color="primary">
              Email: <span className="font-medium">admin@gmail.com</span> /
              Pass: <span className="font-medium">admin</span>
            </Typography>
          </Alert> */}
          <Snackbar
              open={snackbarOpen}
              autoHideDuration={2000} // Durasi tampil Snackbar (2 detik)
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MuiAlert
                onClose={handleSnackbarClose}
                severity="success"
                sx={{ width: "100%" }}
              >
                Login successful! Redirecting...
              </MuiAlert>
            </Snackbar>
          <form
  noValidate
  autoComplete="off"
  action={() => {}}
  onSubmit={handleSubmit(onSubmit)}
  className="flex flex-col gap-6"
>
  {errorState && (
    <Alert severity="error" className="gap-2">
      {errorState.message.map((msg, index) => (
        <Typography key={index} variant="body2">
          {msg}
        </Typography>
      ))}
    </Alert>
  )}
  <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              value={field.value || ""}
              autoFocus
              fullWidth
              type="text"
              label="Username"
              placeholder="Enter your username"
              onChange={(e) => {
                field.onChange(e.target.value);
                errorState !== null && setErrorState(null);
              }}
              {...(errors.username && {
                error: true,
                helperText: errors.username.message,
              })}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              value={field.value || ""}
              fullWidth
              label="Password"
              placeholder="············"
              id="login-password"
              type={isPasswordShown ? "text" : "password"}
              onChange={(e) => {
                field.onChange(e.target.value);
                errorState !== null && setErrorState(null);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={handleClickShowPassword}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <i
                        className={
                          isPasswordShown ? "tabler-eye" : "tabler-eye-off"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...(errors.password && {
                error: true,
                helperText: errors.password.message,
              })}
            />
          )}
        />
  <Button fullWidth variant="contained" type="submit">
    Login
  </Button>
</form>
        </div>
      </div>
    </div>
  );
};

export default Login;
