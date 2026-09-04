import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpoonfulLogo from "../../components/SpoonfulLogo/SpoonfulLogo";
import userService from "../../utils/userService";
import "./ProfilePage.css";

type ProfilePageProps = {
  onSignOut: () => void;
};

export default function ProfilePage({ onSignOut }: ProfilePageProps) {
  const navigate = useNavigate();
  const user = userService.getUser();
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function handleSignOut() {
    onSignOut();
    navigate("/");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      await userService.updateProfile({ email, password });
      setPassword("");
      setSuccessMessage("Your profile info was successfully updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your profile.");
    }
  }

  async function handleDeleteAccount() {
    setError("");
    try {
      await userService.deleteProfile();
      onSignOut();
      navigate("/");
    } catch (err) {
      setShowDeleteModal(false);
      setError(err instanceof Error ? err.message : "Unable to delete your account.");
    }
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <button className="profile-brand" type="button" onClick={handleSignOut}><SpoonfulLogo /></button>
      </header>
      <section className="profile-content" aria-labelledby="profile-heading">
        <nav className="profile-breadcrumbs" aria-label="Breadcrumb"><Link to="/recipes">Home</Link><span>&gt;</span><span>Your Profile</span></nav>
        <h1 id="profile-heading">Your Profile</h1>
        {successMessage && <p className="profile-success-message" role="status">{successMessage}</p>}
        <form className="profile-form" onSubmit={handleSave}>
          <label htmlFor="profile-email">Username</label>
          <input id="profile-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="profile-password">Password</label>
          <input id="profile-password" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="**************" />
          <button className="profile-save" type="submit">Save Changes</button>
          <button className="profile-logout" type="button" onClick={handleSignOut}>Log Out</button>
          <button className="profile-delete" type="button" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
          {error && <p className="profile-error">{error}</p>}
        </form>
      </section>
      {showDeleteModal && (
        <div className="profile-delete-backdrop" role="presentation">
          <section className="profile-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-account-heading">
            <h2 id="delete-account-heading">Delete account?</h2>
            <p>Do you want to delete your account? This action cannot be undone.</p>
            <button className="profile-delete-confirm" type="button" onClick={handleDeleteAccount}>Yes, Delete Account</button>
            <button className="profile-delete-cancel" type="button" onClick={() => setShowDeleteModal(false)}>Nevermind</button>
          </section>
        </div>
      )}
    </main>
  );
}