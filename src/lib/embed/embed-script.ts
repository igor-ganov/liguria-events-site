/**
 * The widget loader a venue pastes once.
 *
 * It finds its own tag, puts an iframe where the tag stands, and listens for the
 * height the frame reports — an iframe cannot size itself, and a widget that is
 * always 400px tall is a widget with a scrollbar in it. Written as a string
 * rather than a module because it is served to other people's pages, where
 * nothing of ours exists.
 */
export const embedScript = (origin: string): string =>
  `(function(){var t=document.currentScript;if(!t)return;` +
  `var v=t.getAttribute('data-venue')||'';if(!/^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(v))return;` +
  `var f=document.createElement('iframe');` +
  `f.src='${origin}/embed/'+v+'/';f.title='Eventi';f.loading='lazy';` +
  `f.setAttribute('scrolling','no');` +
  `f.style.cssText='width:100%;border:0;display:block;height:220px';` +
  `t.parentNode.insertBefore(f,t);` +
  `addEventListener('message',function(e){` +
  `if(e.source!==f.contentWindow)return;var d=e.data;` +
  `if(d&&d.dovego==='height'&&typeof d.px==='number')f.style.height=Math.max(80,Math.min(2000,d.px))+'px'})})();`;
