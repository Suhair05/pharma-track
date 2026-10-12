import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

const supportEmail = 'kingsfordobosu41@gmail.com';

const sectionClass = 'scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7';

interface AboutPoliciesScreenProps {
  onBack?: () => void;
}

const SectionHeading: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} tabIndex={-1} className="mb-4 scroll-mt-6 text-xl font-bold tracking-tight text-slate-900">
    {children}
  </h2>
);

export const AboutPoliciesScreen: React.FC<AboutPoliciesScreenProps> = ({ onBack }) => (
  <div className="mx-auto max-w-5xl space-y-6 py-6 text-sm leading-7 text-slate-600">
    {onBack && (
      <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-brand-700 hover:bg-brand-50">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back
      </button>
    )}
    <header className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Axelle MD</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">About, policies & accessibility</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Information about the product, personal data, cookies, service terms, and the third-party software identified in the application.
        Reviewed October 12, 2026.
      </p>
    </header>

    <nav aria-label="About and policy sections" className="rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-slate-900">On this page</h2>
      <ul className="flex flex-wrap gap-2">
        {[
          ['about-business', 'About the business'],
          ['privacy-policy', 'Privacy policy'],
          ['terms-of-service', 'Terms of service'],
          ['cookie-policy', 'Cookie policy'],
          ['third-party-audit', 'Third-party and cookie audit'],
          ['accessibility', 'Accessibility'],
        ].map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 font-medium text-brand-700 hover:bg-brand-50">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <section id="about-business" aria-labelledby="about-business-heading" className={sectionClass}>
      <SectionHeading id="about-business-heading">About the business</SectionHeading>
      <p>
        Axelle MD is pharmacy management software intended to help pharmacies in Ghana organize stock, batches, dispensing,
        sales, suppliers, and related operational records. It is a software product, not a pharmacy, healthcare provider,
        medicines regulator, or substitute for professional clinical judgment.
      </p>
      <p className="mt-3">
        <strong className="text-slate-800">Product contact:</strong>{' '}
        <a className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2" href={`mailto:${supportEmail}`}>
          {supportEmail}
        </a>
      </p>
      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900">
        The repository identifies the product as Axelle MD but does not specify a registered legal entity or business address.
        This page does not claim a legal company name or physical office.
      </p>
    </section>

    <section id="privacy-policy" aria-labelledby="privacy-policy-heading" className={sectionClass}>
      <SectionHeading id="privacy-policy-heading">Privacy policy</SectionHeading>
      <p>
        This notice describes the application behavior visible in the current code. Your pharmacy may have additional privacy
        obligations when it enters information about employees, suppliers, or patients. Do not enter information you are not
        authorized to manage.
      </p>
      <h3 className="mt-5 font-semibold text-slate-900">Information handled</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Account details such as email, profile name, and pharmacy/staff role.</li>
        <li>Pharmacy operations such as inventory, batch and expiry details, stock movements, sales, suppliers, and reconciliation.</li>
        <li>Where a pharmacy uses those features, patient contact/profile details and prescription or dispensing records.</li>
        <li>Authentication and session information needed to sign in and authorize API requests.</li>
      </ul>
      <h3 className="mt-5 font-semibold text-slate-900">Use, storage, and providers</h3>
      <p>
        The application uses Supabase Auth and its database for authentication and application records. The API runs on the
        configured server host (currently Render in this deployment setup), and Vercel can serve the frontend and proxy API
        requests. Those providers may process technical request information under their own terms. The code does not define a
        retention schedule or guarantee a data region; ask the operator before entering sensitive records if those details matter.
      </p>
      <p className="mt-3">
        The app uses records to provide pharmacy-management features, enforce account and staff permissions, and keep operational
        records available to the pharmacy. It does not intentionally sell application data. Do not treat this statement as a
        substitute for verifying the operator’s provider agreements and legal obligations.
      </p>
      <h3 className="mt-5 font-semibold text-slate-900">Access, correction, and questions</h3>
      <p>
        Pharmacy administrators should manage access for their staff and handle data entered for their pharmacy. For an account
        or privacy request, contact <a className="text-brand-700 underline underline-offset-2" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        Include enough information to understand the request, but do not email passwords, access tokens, or unnecessary patient information.
      </p>
    </section>

    <section id="terms-of-service" aria-labelledby="terms-of-service-heading" className={sectionClass}>
      <SectionHeading id="terms-of-service-heading">Terms of service</SectionHeading>
      <p>
        Use Axelle MD only if you are authorized to access the account and the pharmacy records. Keep credentials confidential,
        assign staff only the permissions they need, and promptly remove access that is no longer required.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>You are responsible for the accuracy and lawful handling of information your pharmacy enters.</li>
        <li>Do not use the software to bypass pharmacy, medicines, privacy, recordkeeping, or other applicable requirements.</li>
        <li>Inventory, expiry, and safety indicators support recordkeeping; verify medicines and decisions using authoritative records and qualified professionals.</li>
        <li>The software is provided as an operational tool, not clinical advice, a dispensing authorization, or a guarantee of regulatory compliance.</li>
        <li>Do not attempt unauthorized access, disrupt the service, or upload malicious content.</li>
      </ul>
      <p className="mt-3">
        The repository does not establish a service-level commitment, fees, governing-law clause, dispute process, or registered
        contracting entity. This summary is not a complete legal agreement. The operator should obtain local legal review and
        publish complete business and contractual details before relying on these terms.
      </p>
    </section>

    <section id="cookie-policy" aria-labelledby="cookie-policy-heading" className={sectionClass}>
      <SectionHeading id="cookie-policy-heading">Cookie policy</SectionHeading>
      <p>
        The application code sets one first-party cookie, <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">pharmatrack_session</code>,
        after sign-in. It carries the signed server session used for authentication; it is marked HttpOnly, Secure in production,
        and SameSite=Strict. It expires after eight hours by default or up to 30 days when “Remember me” is selected. Signing out
        or detecting an invalid session clears it.
      </p>
      <p className="mt-3">
        This session cookie is necessary for the requested sign-in and protected features. The application does not provide an
        optional analytics/advertising cookie toggle because its code does not include an analytics or advertising cookie SDK.
        Hosting-provider logs or provider-managed technologies are governed by those providers’ own notices.
      </p>
    </section>

    <section id="third-party-audit" aria-labelledby="third-party-audit-heading" className={sectionClass}>
      <SectionHeading id="third-party-audit-heading">Third-party and cookie audit</SectionHeading>
      <p>
        Source and dependency manifests were reviewed on October 12, 2026. This is a code-level inventory, not a network scan
        of every deployed browser request or a vendor contract review.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
          <caption className="sr-only">Third-party SDK and cookie audit findings</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-900">
              <th scope="col" className="py-2 pr-4">Provider / SDK</th>
              <th scope="col" className="py-2 pr-4">Observed use</th>
              <th scope="col" className="py-2">Cookie / storage finding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <th scope="row" className="py-3 pr-4 font-semibold text-slate-800">Supabase JS</th>
              <td className="py-3 pr-4">Authentication from the browser; database access from the server.</td>
              <td className="py-3">Browser SDK persistence is disabled; the app’s server sets the first-party session cookie above.</td>
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-4 font-semibold text-slate-800">Google GenAI SDK</th>
              <td className="py-3 pr-4">Present in package dependencies; no usage found in application source during this audit.</td>
              <td className="py-3">No SDK call or SDK-created cookie observed in the reviewed application code.</td>
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-4 font-semibold text-slate-800">Vercel / Render</th>
              <td className="py-3 pr-4">Frontend hosting/proxy and API hosting in the described deployment.</td>
              <td className="py-3">Provider-side logs or cookies are outside this code audit; consult their current privacy documentation.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        No analytics, advertising, or session-replay SDK calls were found in the reviewed application source. Re-run this audit
        when dependencies, tracking scripts, hosting, or authentication behavior changes.
      </p>
    </section>

    <section id="accessibility" aria-labelledby="accessibility-heading" className={sectionClass}>
      <SectionHeading id="accessibility-heading">Accessibility</SectionHeading>
      <p>
        The application uses native buttons and links for navigation, visible keyboard-focus styling, a skip-to-main-content
        link, and text labels for interactive controls. The current source contains no HTML image elements; decorative interface
        icons are not information-bearing images, and the sales chart has an accessible name.
      </p>
      <p className="mt-3">
        Use Tab and Shift+Tab to move through controls, Enter or Space to activate buttons, and the section links above to jump
        to a policy. This is not a claim of conformance to an accessibility standard; report barriers to{' '}
        <a className="text-brand-700 underline underline-offset-2" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-slate-700">
        <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>Accessibility and product contact: {supportEmail}</span>
      </div>
    </section>

    <p className="px-1 text-xs text-slate-500">
      These policy summaries describe the current application code and are not legal advice. The product operator should have
      them reviewed against its actual business identity, data practices, provider agreements, and applicable law.
    </p>
  </div>
);
