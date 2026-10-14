/**
 * Inquiry / Quote Request Page Template
 */

export function renderInquiryPage(site) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Request a Quote</li>
      </ol>
    </nav>
  </div>

  <!-- Page Header -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Start Your Project</span>
        <h1>Request a Project Quote &amp; Consultation</h1>
        <p>
          Tell us about your brand, requirements, and timeline. Lead Developer Aatif Kureshi will personally analyze your project and provide a transparent proposal within 24 hours.
        </p>
      </div>
    </div>
  </section>

  <!-- Inquiry Form Section -->
  <section class="section">
    <div class="container" style="max-width: 860px;">
      <div class="form-container-card edge-corner-frame reveal">
        <form id="inquiry-form" method="POST" action="/api/inquiry" novalidate>
          <!-- Anti-Spam Honeypots & Minimum Fill Timer -->
          <input type="text" name="_gotcha" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none!important;">
          <input type="text" name="website_url_hp" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none!important;">
          <input type="hidden" name="_form_time" value="">

          <div class="form-grid form-grid--2col">
            <!-- Full Name -->
            <div class="form-group">
              <label for="name" class="form-label">Full Name <span class="required">*</span></label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                class="form-control" 
                placeholder="e.g. Rahul Sharma" 
                required
              >
              <div class="form-error-msg"></div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Email Address <span class="required">*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                placeholder="e.g. rahul@example.com" 
                required
              >
              <div class="form-error-msg"></div>
            </div>
          </div>

          <div class="form-grid form-grid--2col">
            <!-- Phone / WhatsApp -->
            <div class="form-group">
              <label for="phone" class="form-label">Phone / WhatsApp Number <span class="required">*</span></label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                class="form-control" 
                placeholder="e.g. 9825123456 or +91 98251 23456" 
                required
              >
              <div class="form-error-msg"></div>
            </div>

            <!-- Business Name -->
            <div class="form-group">
              <label for="business_name" class="form-label">Business / Brand Name</label>
              <input 
                type="text" 
                id="business_name" 
                name="business_name" 
                class="form-control" 
                placeholder="e.g. Sharma Textiles"
              >
            </div>
          </div>

          <div class="form-grid form-grid--2col">
            <!-- Business Type -->
            <div class="form-group">
              <label for="business_type" class="form-label">Business Category / Type</label>
              <select id="business_type" name="business_type" class="form-control">
                <option value="">Select your business category...</option>
                <option value="Retail & Local Shop">Retail &amp; Local Shop</option>
                <option value="Textile & Garments">Textile &amp; Garments (Surat)</option>
                <option value="Diamond & Jewellery">Diamond &amp; Jewellery</option>
                <option value="Manufacturing & Industrial">Manufacturing &amp; Industrial</option>
                <option value="Doctor / Clinic / Healthcare">Doctor / Clinic / Healthcare</option>
                <option value="Professional & Consulting">Professional &amp; Consulting</option>
                <option value="Restaurant & Food">Restaurant &amp; Food</option>
                <option value="Real Estate & Architecture">Real Estate &amp; Architecture</option>
                <option value="Other Startup / Brand">Other Startup / Brand</option>
              </select>
            </div>

            <!-- Interested In -->
            <div class="form-group">
              <label for="interest" class="form-label">Interested In <span class="required">*</span></label>
              <select id="interest" name="interest" class="form-control" required>
                <option value="">Select plan or service...</option>
                <optgroup label="Website Plans">
                  <option value="Starter Website">Starter Website (₹4,999 onwards)</option>
                  <option value="Standard Catalogue">Standard Catalogue (₹9,999 onwards)</option>
                  <option value="Premium Website">Premium Website (₹14,999 onwards)</option>
                  <option value="E-commerce Solution">E-commerce Solution (₹24,999 onwards)</option>
                </optgroup>
                <optgroup label="Specialized Services">
                  <option value="Web Design & Development">Web Design &amp; Development</option>
                  <option value="Digital Marketing & Local SEO">Digital Marketing &amp; Local SEO</option>
                  <option value="Graphic Design & Brand Identity">Graphic Design &amp; Brand Identity</option>
                  <option value="Video Editing & Motion Graphics">Video Editing &amp; Motion Graphics</option>
                  <option value="Business Solutions & Automation">Business Solutions &amp; Automation</option>
                  <option value="Not sure yet">Not sure yet (Need Consultation)</option>
                </optgroup>
              </select>
              <div class="form-error-msg"></div>
            </div>
          </div>

          <div class="form-grid form-grid--2col">
            <!-- Budget -->
            <div class="form-group">
              <label for="budget" class="form-label">Estimated Budget</label>
              <select id="budget" name="budget" class="form-control">
                <option value="">Select approximate budget...</option>
                <option value="₹4,999 - ₹10,000">₹4,999 - ₹10,000</option>
                <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                <option value="₹50,000+">₹50,000+</option>
                <option value="Not sure yet">Not sure yet / Flexible</option>
              </select>
            </div>

            <!-- Timeline -->
            <div class="form-group">
              <label for="timeline" class="form-label">Desired Timeline</label>
              <select id="timeline" name="timeline" class="form-control">
                <option value="">When do you need this launched?</option>
                <option value="Urgent (Within 1 week)">Urgent (Within 1 week)</option>
                <option value="Standard (1 - 2 weeks)">Standard (1 - 2 weeks)</option>
                <option value="Flexible (2 - 4 weeks)">Flexible (2 - 4 weeks)</option>
                <option value="Just planning for future">Just planning for future</option>
              </select>
            </div>
          </div>

          <!-- Project Details -->
          <div class="form-group">
            <label for="details" class="form-label">Project Details &amp; Requirements <span class="required">*</span></label>
            <textarea 
              id="details" 
              name="details" 
              class="form-control" 
              rows="5" 
              placeholder="Tell us what your website needs: number of pages, products, reference links, specific features, or questions..."
              required
            ></textarea>
            <div class="form-error-msg"></div>
          </div>

          <!-- Preferred Contact Method -->
          <div class="form-group">
            <label for="contact_method" class="form-label">Preferred Contact Method</label>
            <select id="contact_method" name="contact_method" class="form-control" style="max-width: 320px;">
              <option value="WhatsApp" selected>WhatsApp (Fastest response)</option>
              <option value="Phone Call">Direct Phone Call</option>
              <option value="Email">Email Communication</option>
            </select>
          </div>

          <!-- DPDP Consent -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="consent" value="true" required checked>
              <span>I consent to AK Digital Studio contacting me regarding this project inquiry in accordance with the <a href="/privacy/" target="_blank" style="color: var(--color-royal); text-decoration: underline;">Privacy Policy</a>.</span>
            </label>
            <div class="form-error-msg"></div>
          </div>

          <!-- Submit Button -->
          <div style="margin-top: 28px;">
            <button type="submit" class="btn btn--primary btn--lg" style="width: 100%;">
              <span>Submit Project Inquiry</span>
            </button>
            <p style="margin-top: 14px; font-size: 0.88rem; color: var(--color-slate); text-align: center;">
              🔒 Strictly confidential &bull; Zero spam &bull; Direct reply within 24 hours
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</main>
<script type="module" src="/js/forms.js"></script>
`;
}
