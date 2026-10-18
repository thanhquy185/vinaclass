import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState } from "react";

// Component test cho ErrorBoundary wrapper
function BoundaryWrapperTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("🛡️ ErrorBoundary Wrapper Test - Caught by ErrorBoundary!");
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="w-full rounded-lg bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600"
    >
      🛡️ Test ErrorBoundary
    </button>
  );
}

// Component test cho ErrorPage (route error)
function RouteErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("💥 Route Error - Caught by ErrorPage!");
  }

  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="w-full rounded-lg bg-red-500 px-4 py-3 text-white transition-colors hover:bg-red-600"
    >
      🎯 Test Route Error (ErrorPage)
    </button>
  );
}

// Component test cho async error (KHÔNG được catch)
function AsyncErrorTest() {
  const handleAsyncError = () => {
    setTimeout(() => {
      throw new Error("⏰ Async Error - Won't be caught!");
    }, 100);
  };

  return (
    <button
      onClick={handleAsyncError}
      className="w-full rounded-lg bg-orange-500 px-4 py-3 text-white transition-colors hover:bg-orange-600"
    >
      ⚠️ Test Async Error (Uncaught)
    </button>
  );
}

// Component test cho event handler error (cần try-catch)
function EventHandlerErrorTest() {
  const handleClick = () => {
    try {
      throw new Error("🖱️ Event Handler Error");
    } catch (error) {
      console.error("Caught in event handler:", error);
      alert("Event handler error caught! Check console.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-lg bg-yellow-500 px-4 py-3 text-white transition-colors hover:bg-yellow-600"
    >
      🖱️ Test Event Handler Error (Manual Catch)
    </button>
  );
}

// Component test cho Promise rejection
function PromiseRejectionTest() {
  const handlePromiseError = () => {
    Promise.reject(new Error("🚫 Promise Rejection - Won't be caught!")).catch(
      (error) => {
        console.error("Promise rejection:", error);
        alert("Promise rejection! Check console.");
      }
    );
  };

  return (
    <button
      onClick={handlePromiseError}
      className="w-full rounded-lg bg-purple-500 px-4 py-3 text-white transition-colors hover:bg-purple-600"
    >
      🚫 Test Promise Rejection
    </button>
  );
}

export default function ErrorBoundaryTestPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-neutral-900">
            Error Boundary Test Suite
          </h1>
          <p className="mb-8 text-neutral-600">
            Test different error scenarios to see how they're handled
          </p>

          <div className="space-y-4">
            {/* Test 0: ErrorBoundary Wrapper */}
            <ErrorBoundary>
              <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">
                  0. ErrorBoundary Component (Wrapper)
                </h3>
                <p className="mb-3 text-sm text-blue-700">
                  ✅ Caught by{" "}
                  <code className="rounded bg-blue-100 px-1">
                    ErrorBoundary
                  </code>{" "}
                  wrapper (shows ErrorBoundary UI inside this card)
                </p>

                <BoundaryWrapperTest />
              </div>
            </ErrorBoundary>

            {/* Test 1: Route Error */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">
                1. Route Component Error
              </h3>
              <p className="mb-3 text-sm text-neutral-600">
                ✅ Should be caught by{" "}
                <code className="rounded bg-neutral-100 px-1">ErrorPage</code>
              </p>
              <RouteErrorTest />
            </div>

            {/* Test 2: Async Error */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">
                2. Async Error (setTimeout)
              </h3>
              <p className="mb-3 text-sm text-neutral-600">
                ❌ Won't be caught by Error Boundary (check browser console)
              </p>
              <AsyncErrorTest />
            </div>

            {/* Test 3: Event Handler Error */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">
                3. Event Handler Error
              </h3>
              <p className="mb-3 text-sm text-neutral-600">
                ℹ️ Manually caught with try-catch
              </p>
              <EventHandlerErrorTest />
            </div>

            {/* Test 4: Promise Rejection */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">
                4. Promise Rejection
              </h3>
              <p className="mb-3 text-sm text-neutral-600">
                ℹ️ Manually caught with .catch()
              </p>
              <PromiseRejectionTest />
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">
              📝 What gets caught?
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✅ Errors during component render</li>
              <li>✅ Errors in lifecycle methods</li>
              <li>✅ Errors in constructor</li>
              <li>❌ Event handler errors (need try-catch)</li>
              <li>❌ Async errors (setTimeout, promises)</li>
              <li>❌ Server-side rendering errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
