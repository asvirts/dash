import type { Metadata } from "next";
import { CONTACT_EMAIL } from "../site";

export const metadata: Metadata = { title: "Privacy · Anygym" };

export default function Privacy() {
  return (
    <article className="max-w-2xl py-16 text-sm leading-relaxed text-mute [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Privacy policy</h1>

      <h2>The short version</h2>
      <p>Anygym works without an account. We don’t sell your data, and we don’t use it for ads.</p>

      <h2>Without an account</h2>
      <p>Your routines, gyms and workout history are stored only on your phone.</p>

      <h2>With an account</h2>
      <p>
        If you sign in, your email address, routines, gyms and workout history are stored in our database (hosted by Supabase) so
        they can sync between devices. Deleting a routine, gym or workout removes it from the database.
      </p>

      <h2>Gym photos and videos</h2>
      <p>
        When you scan a gym, a few still images are sent to our server and passed to our AI provider, Anthropic, to identify
        the equipment. Anygym doesn’t store the images. Only the resulting equipment list is saved with your gym.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or deletion requests: <a href={`mailto:${CONTACT_EMAIL}`} className="text-lime">{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}
