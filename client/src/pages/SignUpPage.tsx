import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { Loader } from "../components/Loader";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from "../appStore";
import { useRequest } from "../hooks";
import { isNoFormErrors, validate } from "../utils";
import { LoaderTypes } from "../types";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(16),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      marginTop: 0,
      marginBottom: "32px",
    },
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  signUpPageWrapper: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column-reverse",
    },
  },
  descriptionWrapper: {
    width: "68%",
    marginTop: "78px",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  video: {
    display: "flex",
    width: "98%",
    border: "1px solid silver",
    borderRadius: "16px",
    padding: "2vw",
    [theme.breakpoints.down("sm")]: {
      margin: "0 auto",
    },
  },
  description: {
    width: "65%",
    margin: "16px auto",
    padding: "1vw",
    border: "1px solid silver",
    borderRadius: "16px",
    [theme.breakpoints.down("sm")]: {
      width: "80%",
    },
  },
}));

export const SignUpPage = () => {
  const classes = useStyles();
  const { setNotification } = useContext(StoreContext);
  const navigate = useNavigate();

  const { request, isLoading, fetchCsrfToken } = useRequest();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  const changeHandler = useCallback(
    (event: ChangeEvent<HTMLFormElement>) => {
      setForm({
        ...form,
        [event.target.name]: event.target.value,
      });

      if (formErrors.email !== "" && event.target.name === "email") {
        setFormErrors({ ...formErrors, email: "" });
      }
      if (formErrors.password !== "" && event.target.name === "password") {
        setFormErrors({ ...formErrors, password: "" });
      }
    },
    [form, setForm, formErrors, setFormErrors]
  );

  const signUpHandler = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const errors = validate({ email: form.email, password: form.password });
      if (isNoFormErrors(errors)) {
        const csrfToken = await fetchCsrfToken();

        const signUpData = await request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            ...form,
          }),
          headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token": csrfToken,
          },
        });

        setNotification({
          isOpen: true,
          message: signUpData.message,
          severity: "success",
        });

        const response = await request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        if (response.status === "authenticated") {
          navigate("/");
        }
      } else {
        setFormErrors(errors);
      }
    },
    [form, request, setNotification, fetchCsrfToken, navigate]
  );

  return (
    <div className={classes.signUpPageWrapper}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <form
            className={classes.form}
            onSubmit={signUpHandler}
            onChange={changeHandler}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/sign-in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
      <div className={classes.descriptionWrapper}>
        <video
          className={classes.video}
          autoPlay
          loop
          muted
          playsInline
          poster="/dropnotes_demo_poster.jpeg"
        >
          <source src="/dropnotes_demo.mp4" type="video/mp4" />
        </video>
        <Typography
          className={classes.description}
          variant="body2"
          align="center"
        >
          With Dropnotes app, managing your notes is a breeze. Just create a
          user profile and you are good to go. These can be both simple text
          notes and notes in the form of a chat with artificial intelligence.
          You can communicate with it using both text and voice messages. In
          turn, chat GPT will answer you with a voice, which will make your
          communication as close to natural as possible.
        </Typography>
      </div>
      {isLoading && <Loader type={LoaderTypes.dots} />}
    </div>
  );
};
