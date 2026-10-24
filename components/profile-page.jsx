"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, CircleUserRound, Mail, PackageCheck, ShoppingBag, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

export function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  if (isPending) {
    return (
      <main className="profile-page wrap" aria-busy="true">
        <div className={"profile-heading"}><span className="eyebrow">YOUR LEEBAZZ ACCOUNT</span><h1>My profile</h1></div>
        <p className={"profile-loading"} role="status">Loading your account…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page wrap">
        <div className={"profile-heading"}><span className="eyebrow">YOUR LEEBAZZ ACCOUNT</span><h1>My profile</h1></div>
        <section className={"profile-signin-card"}>
          <CircleUserRound size={30} strokeWidth={1.3} />
          <h2>Sign in to view your profile</h2>
          <p>Your account details and purchase history are available after you sign in.</p>
          <Link className="button button-dark" href="/login">Log in <ArrowUpRight size={15} /></Link>
        </section>
      </main>
    );
  }

  return <SignedInProfile user={user} />;
}

function SignedInProfile({ user }) {
  const [name, setName] = useState(user.name || "");
  const [imageUrl, setImageUrl] = useState(user.image?.startsWith("data:") ? "" : user.image || "");
  const [savedImage, setSavedImage] = useState(user.image || "");
  const [imageUrlEdited, setImageUrlEdited] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const imageFileRef = useRef(null);

  async function chooseImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError("Choose an image smaller than 8 MB.");
      return;
    }

    setProcessingImage(true);
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 30_000_000) {
        bitmap.close();
        throw new Error("This image is too large to process. Choose a smaller photo.");
      }
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare this image.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      setUploadedImage(canvas.toDataURL("image/jpeg", 0.82));
      setImageFailed(false);
    } catch (error) {
      setImageError(error.message || "Could not read that image. Please choose another file.");
    } finally {
      setProcessingImage(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const nextName = name.trim();
    if (nextName.length < 2 || nextName.length > 80) {
      toast.error("Your name must be between 2 and 80 characters.");
      return;
    }
    const nextImage = uploadedImage || (imageUrlEdited ? imageUrl.trim() : savedImage);
    if (nextName === user.name && nextImage === (user.image || "")) {
      toast.info("Your profile is already up to date.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await authClient.updateUser({ name: nextName, image: nextImage });
      if (error) {
        toast.error(error.message || "Could not update your profile.");
        return;
      }
      setName(nextName);
      setSavedImage(nextImage);
      setImageUrl(nextImage.startsWith("data:") ? "" : nextImage);
      setImageUrlEdited(false);
      setUploadedImage("");
      toast.success("Your profile has been updated.");
    } catch (error) {
      toast.error(error.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = user.name?.trim() || "Leebazz customer";
  const initials = displayName.slice(0, 1).toLocaleUpperCase();
  const previewImage = uploadedImage || (imageUrlEdited ? imageUrl.trim() : savedImage);
  const profileChanged = name.trim() !== (user.name || "") || previewImage !== (user.image || "");
  const avatar = previewImage && !imageFailed
    ? <Image src={previewImage} alt="" width={58} height={58} unoptimized onError={() => setImageFailed(true)} />
    : initials;

  return (
    <main className="profile-page wrap">
      <header className={"profile-heading"}>
        <span className="eyebrow">YOUR LEEBAZZ ACCOUNT</span>
        <h1>My profile</h1>
        <p>Manage your account details and keep track of your orders.</p>
      </header>

      <div className={"profile-layout"}>
        <aside className={"profile-summary"}>
          <div className={"profile-avatar"} aria-hidden="true">{avatar}</div>
          <span className={"profile-summary-label"}>Welcome back</span>
          <h2>{displayName}</h2>
          <p>{user.email}</p>
          <nav className={"profile-nav"} aria-label="Profile sections">
            <a href="#account-details"><CircleUserRound size={17} />Account details</a>
            <a href="#purchase-history"><PackageCheck size={17} />Purchase history</a>
          </nav>
        </aside>

        <div className={"profile-main"}>
          <section className={"profile-card"} id="account-details">
            <div className={"profile-card-heading"}>
              <div><span className="eyebrow">PERSONAL INFORMATION</span><h2>Account details</h2></div>
              <CircleUserRound size={22} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <form className={"profile-form"} onSubmit={saveProfile}>
              <label className={"profile-field"} htmlFor="profile-name">
                <span>Full name</span>
                <input id="profile-name" name="name" autoComplete="name" maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <div className={"profile-field"}>
                <label htmlFor="profile-image">Profile image URL</label>
                <span className={"profile-image-editor"}>
                  <span className={"profile-image-preview"} aria-hidden="true">{avatar}</span>
                  <input id="profile-image" name="image" type="url" autoComplete="url" maxLength={2048} value={imageUrl} onChange={(event) => { setImageUrl(event.target.value); setImageUrlEdited(true); setUploadedImage(""); setImageError(""); setImageFailed(false); }} placeholder="https://example.com/your-photo.jpg" />
                </span>
                <div className={"profile-image-upload-row"}>
                  <input ref={imageFileRef} className={"profile-file-input"} id="profile-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} disabled={processingImage || saving} />
                  <label className={"profile-image-upload-button"} htmlFor="profile-image-file" aria-disabled={processingImage || saving}>
                    <Upload size={15} aria-hidden="true" />{processingImage ? "Preparing image…" : "Choose from device"}
                  </label>
                  {uploadedImage && <button className={"profile-image-clear"} type="button" onClick={() => { setUploadedImage(""); setImageError(""); }} disabled={saving}><X size={14} />Discard upload</button>}
                </div>
                <small>Paste a public image URL or choose a JPG, PNG, or WebP photo up to 8 MB. Device photos are resized before saving.</small>
                {imageError && <small className={"profile-image-error"} role="alert">{imageError}</small>}
              </div>
              <label className={"profile-field"} htmlFor="profile-email">
                <span>Email address</span>
                <span className={"profile-email-wrap"}><Mail size={16} aria-hidden="true" /><input id="profile-email" type="email" value={user.email || ""} readOnly aria-describedby="email-note" /></span>
                <small id="email-note">Your email is used to sign in and can’t be changed here.</small>
              </label>
              <div className={"profile-form-actions"}>
                <button className="button button-dark" type="submit" disabled={saving || processingImage || !profileChanged}>
                  {saving ? "Saving…" : <><Check size={15} />Save changes</>}
                </button>
                <span>Changes are saved securely to your account.</span>
              </div>
            </form>
          </section>

          <section className={"profile-card"} id="purchase-history">
            <div className={"profile-card-heading"}>
              <div><span className="eyebrow">YOUR ORDERS</span><h2>Purchase history</h2></div>
              <PackageCheck size={22} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <div className={"profile-orders-empty"}>
              <span className={"profile-orders-icon"}><ShoppingBag size={23} strokeWidth={1.4} /></span>
              <h3>No purchases yet</h3>
              <p>Orders you place will appear here. Checkout and order tracking aren’t available on the store yet.</p>
              <Link href="/shop" className={"profile-shop-link"}>Explore the collection <ArrowUpRight size={15} /></Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
