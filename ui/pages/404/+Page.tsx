import { useCallback } from "react";
import { navigate } from "vike/client/router";
import { TopNav } from "@/components/TopNav/TopNav";
import "./+Page.css";

/**
 * 404 error page with neo-brutalist styling.
 */
export const Page = () => {
  const handleBackToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, []);

  return (
    <div className="four-oh-four-page">
      <TopNav />
      <div className="four-oh-four-content">
        <div className="four-oh-four-error-card">
          <div className="four-oh-four-error-icon">❌</div>
          <h1 className="four-oh-four-title">404 - Page Not Found</h1>
          <p className="four-oh-four-description">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <button
            className="four-oh-four-back-button"
            onClick={handleBackToDashboard}
            type="button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
