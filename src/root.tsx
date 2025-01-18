// @refresh reload
import { Suspense, onMount } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title
} from "solid-start";
import "./root.css";
import Navbar from "@/components/Navbar";
import { useRegisterSW } from "virtual:pwa-register/solid";
import { Analytics } from "@vercel/analytics/react";

export default function Root() {
  onMount(() => {
    useRegisterSW({
      onOfflineReady() { }
    });
  });

  return (
    <Html lang="en">
      <Head>
        <Title>
          Rubert - The fastest 3x3x3 Rubik's cube solver and timer
        </Title>
        <Meta
          name="color-scheme"
          content="dark"
        />
        <Meta
          name="application-name"
          content="Rubert"
        />
        <Meta
          name="theme-color"
          content="#000000"
        />

        <Meta charset="utf-8" />

        <Meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <Meta
          name="description"
          content="The fastest 3x3x3 Rubik's cube solver and timer. Did your friend scramble that cube you don't know how to solve? Scan it using your camera and solver will solve it for you! Want to practice and test your skills? Use our timer!"
        />

        <Link
          rel="manifest"
          href="/manifest.webmanifest"
        />

        <Link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <Link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <Link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <Link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <Body class="container flex h-full flex-col">
        <Suspense>
          <ErrorBoundary>
            <Navbar />
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
        <Analytics />
      </Body>
    </Html>
  );
}
