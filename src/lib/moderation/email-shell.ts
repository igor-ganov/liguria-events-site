/** Wrap a message body in the branded e-mail shell. */
export const emailShell = (body: string): string =>
  `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
     <h2 style="color:#e07b1f">Dove Go</h2>${body}
     <p style="color:#667;font-size:13px">Questions? Write to public@dovego.it.</p>
   </div>`;
