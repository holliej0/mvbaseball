/* Mountain Valley Baseball Club — small site behaviors */

/* ------------------------------------------------------------------
   CLUB EVENTS
   Add a line for each practice, game, or event. Dates are YYYY-MM-DD.
   They show up on the calendar and in the Upcoming Events list.
------------------------------------------------------------------- */
var MVBC_EVENTS = [
  { date: "2027-04-04", title: "Opening Day" }
];

/* ------------------------------------------------------------------
   CONTACT FORM
   Paste the form endpoint here (for example a Formspree URL like
   https://formspree.io/f/abcdwxyz). Until it is set, the form opens
   the visitor's email app addressed to CONTACT_EMAIL instead.
------------------------------------------------------------------- */
var FORM_ENDPOINT = "";
var CONTACT_EMAIL = "mountainvalleybaseballclub@gmail.com";

(function () {
  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  function parse(d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function key(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }

  // Calendar
  var grid = document.getElementById("cal-grid");
  if (grid) {
    var title = document.getElementById("cal-title");
    var now = new Date();
    var view = new Date(now.getFullYear(), now.getMonth(), 1);
    var byDate = {};
    MVBC_EVENTS.forEach(function (e) { (byDate[e.date] = byDate[e.date] || []).push(e.title); });

    var render = function () {
      var y = view.getFullYear(), m = view.getMonth();
      title.textContent = MONTHS[m] + " " + y;
      var html = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(function (d) {
        return '<div class="cal-dow" role="columnheader">' + d + "</div>";
      }).join("");
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var cells = Math.ceil((first + days) / 7) * 7;
      for (var i = 0; i < cells; i++) {
        var d = i - first + 1;
        if (d < 1 || d > days) { html += '<div class="cal-day"></div>'; continue; }
        var k = key(y, m, d), ev = byDate[k], cls = "cal-day";
        if (ev) cls += " has-event";
        else if (y === now.getFullYear() && m === now.getMonth() && d === now.getDate()) cls += " today";
        html += '<div class="' + cls + '"><span>' + d + "</span>" +
          (ev ? "<em>" + ev.join(", ") + "</em>" : "") + "</div>";
      }
      grid.innerHTML = html;
    };

    document.getElementById("cal-prev").addEventListener("click", function () {
      view.setMonth(view.getMonth() - 1); render();
    });
    document.getElementById("cal-next").addEventListener("click", function () {
      view.setMonth(view.getMonth() + 1); render();
    });

    // Upcoming events list
    var list = document.getElementById("event-list");
    if (list) {
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var upcoming = MVBC_EVENTS.filter(function (e) { return parse(e.date) >= today; })
        .sort(function (a, b) { return parse(a.date) - parse(b.date); }).slice(0, 4);
      var icon = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="9" width="38" height="34" rx="5"/><path d="M5 19h38M15 4v9M33 4v9"/><path d="M14 27h3M22.5 27h3M31 27h3M14 35h3M22.5 35h3M31 35h3" stroke-width="4"/></svg>';
      list.innerHTML = "";
      upcoming.forEach(function (e) {
        var d = parse(e.date);
        var b = document.createElement("button");
        b.type = "button"; b.className = "event";
        b.setAttribute("aria-label", e.title + ", " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + ". Show on calendar.");
        b.innerHTML = icon + "<span>" + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() +
          "<small>" + e.title + "</small></span>";
        b.addEventListener("click", function () {
          view = new Date(d.getFullYear(), d.getMonth(), 1); render();
          document.getElementById("calendar").scrollIntoView({ block: "nearest" });
        });
        list.appendChild(b);
      });
    }
    render();
  }

  // Contact form
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var params = new URLSearchParams(location.search);
    if (params.get("subject")) form.elements.subject.value = params.get("subject");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.elements.website.value) return; // spam trap
      var f = form.elements;
      status.className = "form-status";

      if (!FORM_ENDPOINT) {
        var body = f.message.value + "\n\n" + f.name.value + "\n" + f.email.value;
        location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(f.subject.value) +
          "&body=" + encodeURIComponent(body);
        status.textContent = "Your email app should open with your message ready to send.";
        return;
      }

      status.textContent = "Sending…";
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error();
        form.reset();
        status.textContent = "Thanks! Your message was sent. We will be in touch soon.";
      }).catch(function () {
        status.className = "form-status error";
        status.textContent = "Sorry, that did not go through. Please try again in a moment.";
      });
    });
  }
})();
