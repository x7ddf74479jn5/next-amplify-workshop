import "../styles/index.css";

import React from "react";
import { Amplify } from "aws-amplify";

import { Provider } from "react-redux";
import { store } from "../app/store";

import type { AppProps } from "next/app";
import {
  AmplifyAuthenticator,
  AmplifySignOut,
  AmplifySignUp,
} from "@aws-amplify/ui-react";
import {
  AuthState,
  onAuthUIStateChange,
  SignUpResponseInterface,
} from "@aws-amplify/ui-components";
import awsconfig from "../aws-exports";

import {
  makeStyles,
  createTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

Amplify.configure(awsconfig);

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#1EA1F2",
      contrastText: "#fff",
    },
    background: {
      default: "#15202B",
      paper: "#15202B",
    },
    divider: "#37444C",
  },
  overrides: {
    MuiButton: {
      text: {
        color: "white",
      },
    },
  },
  typography: {
    fontFamily: ["Arial"].join(","),
  },
  // @ts-ignore typesにstatusオプションなし
  status: {
    danger: "orange",
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    width: 800,
    marginLeft: "auto",
    marginRight: "auto",
  },
  appBar: {
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

function MyApp({ Component, pageProps }: AppProps) {
  const [authState, setAuthState] = React.useState<AuthState>();
  const [user, setUser] = React.useState<SignUpResponseInterface | undefined>();

  const classes = useStyles();

  React.useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  ) : (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        formFields={[
          { type: "username" },
          { type: "password" },
          { type: "email" },
        ]}
      />
    </AmplifyAuthenticator>
  );
}

export default MyApp;
