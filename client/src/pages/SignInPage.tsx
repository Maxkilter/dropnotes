import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Loader from "../components/Loader";
import { StoreContext } from "../appStore";
import { useRequest } from "../hooks";
import { LoaderTypes } from "../types";
import { isNoFormErrors, validate } from "../utils";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const SignInPage = () => {
  const classes = useStyles();
  const { logIn, setNotification } = useContext(StoreContext);
  const { isLoading, request, error, clearError } = useRequest();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState({ email: "" });

  useEffect(() => {
    if (error) {
      setNotification({
        isOpen: true,
        message: error,
        severity: "error",
      });
      clearError();
    }
  }, [error, clearError, setNotification]);

  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      setForm({
        ...form,
        [event.target.name]: event.target.value,
      });

      if (formError.email !== "" && event.target.name === "email") {
        setFormError({ email: "" });
      }
    },
    [form, setForm, formError, setFormError]
  );

  const signInHandler = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const error = validate({ email: form.email });
      if (isNoFormErrors(error)) {
        try {
          const data = await request("/api/auth/login", "POST", { ...form });
          logIn(data.token, data.userId);
        } catch (e) {}
      } else {
        setFormError(error);
      }
    },
    [form, logIn, request]
  );

  if (isLoading) {
    return <Loader type={LoaderTypes.darken} />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form
          className={classes.form}
          onSubmit={signInHandler}
          onChange={changeHandler}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            error={!!formError.email}
            helperText={formError.email}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={isLoading}
          >
            Sign In
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/sign-up" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};

export default SignInPage;
