/*
The MIT License

Copyright © 2010-2021 three.js authors
Copyright © 2021 Lifecast Incorporated

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

class HelpGetVR {
  static createBanner(renderer, enter_xr_button_title, exit_xr_button_title, force_hand_tracking) {
    var banner = document.createElement( 'div' );

    function showEnterVR() {
      let currentSession = null;
      async function onSessionStarted( session ) {
        session.addEventListener( 'end', onSessionEnded );
        await renderer.xr.setSession( session );
        banner.innerHTML = exit_xr_button_title;
        currentSession = session;
      }

      function onSessionEnded() {
        currentSession.removeEventListener( 'end', onSessionEnded );
        banner.innerHTML = enter_xr_button_title;
        currentSession = null;
      }

      banner.innerHTML = enter_xr_button_title;
      banner.style.display = 'block';
      banner.style.cursor = 'pointer';
      banner.onmouseenter = function () {
        banner.style.opacity = '1.0';
      };

      banner.onmouseleave = function () {
        banner.style.opacity = '0.75';
      };

      banner.onclick = async function () {
        if ( currentSession === null ) {
          var optionalFeatures = [ 'local-floor', 'bounded-floor', 'layers' ];
          const supports_AR = await navigator.xr.isSessionSupported( 'immersive-ar' );
          if (supports_AR || force_hand_tracking) {
            optionalFeatures.push('hand-tracking');
          }
          const sessionInit = { optionalFeatures: optionalFeatures };
          navigator.xr.requestSession(
           supports_AR ? 'immersive-ar' : 'immersive-vr', sessionInit ).then( onSessionStarted );
        } else {
          currentSession.end();
        }
      };
    }

    function disableButton() {
      banner.onmouseenter = null;
      banner.onmouseleave = null;
      banner.onclick = null;
    }

    function showWebXRNotFound() {
      // Old code shows a nag message:
      //disableButton();
      //banner.innerHTML = 'VR is not available on this device, but you can still watch in 3D. Control the camera by dragging the mouse (left to rotate, right to move). &nbsp; <a style="color: white;" href="how_to_watch_in_VR.html">[Help]</a> &nbsp;';
      //banner.innerHTML += "<span style='cursor: pointer; color: white; text-decoration: underline;'  onclick='parentNode.style.display=\"none\";'>[Dismiss]</span>";

      // New code: show nothing, don't annoy people with a popup that must be dismissed. Just let em figure it out.
      banner.style.display = "none";
    }

    banner.id = 'HelpGetVR';
    banner.style.display = "none";

    var is_ios = navigator.userAgent.match(/iPhone|iPad|iPod/i);

    if (is_ios) {
      banner.innerHTML = "<button onclick='DeviceOrientationEvent.requestPermission(); parentNode.style.display=\"none\";' style='font-size: 24px;'>Enable Tilt Control</button>";
      banner.style.border = '';
      banner.style.display = "block";
      return banner;
    } else if ('xr' in navigator) {
      banner.style.position = 'absolute';
      banner.style.bottom = '15%';
      banner.style.padding = '12px 6px';
      banner.style.border = '1px solid #ffffff40';
      banner.style.borderRadius = '12px';
      banner.style.background = 'rgba(0,0,0,0.5)';
      banner.style.color = '#ffffffff';
      banner.style.font = 'normal 32px sans-serif';
      banner.style.textAlign = 'center';
      banner.style.opacity = '0.75';
      banner.style.outline = 'none';
      banner.style.zIndex = '999';
      banner.style.left = '50%'; // Center the banner horizontally
      banner.style.transform = 'translateX(-50%)'; // Adjust for the banner's width to truly center it
      banner.style.width = '350px';
      navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {
        if (supported) {
          showEnterVR();
        } else {
          showWebXRNotFound();
        }
      } );
      return banner;
    } else {
      if (!window.isSecureContext) {
        banner.innerHTML = 'ERROR: https is required for WebXR.';
      } else {
        showWebXRNotFound();
      }
      return banner;
    }
  }
}

export { HelpGetVR };
