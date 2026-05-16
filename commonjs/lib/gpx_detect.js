  $(function () {
      console.log('[gpx_detect] loaded, page=', mw.config.get('wgCanonicalSpecialPageName'));
      if (mw.config.get('wgCanonicalSpecialPageName') !== 'Upload') return;

      var $input = $('#wpUploadFile');
      var $dest = $('#wpDestFile');
      console.log('[gpx_detect] #wpUploadFile found=', $input.length, '#wpDestFile found=', $dest.length);
      if (!$input.length) return;

      $input.on('change', function () {
          console.log('[gpx_detect] change fired, files=', this.files);
          var file = this.files && this.files[0];
          if (!file) { console.log('[gpx_detect] no file in input'); return; }

          // Defer so MediaWiki's own change handler can auto-populate #wpDestFile first.
          setTimeout(function () {
              var destName = $dest.val() || '';
              console.log('[gpx_detect] source=', file.name, 'dest=', destName);
              if (!/\.kml$/i.test(destName)) {
                  console.log('[gpx_detect] destination is not .kml, skipping');
                  return;
              }

              file.slice(0, 2000).text()
                  .then(function (head) {
                      console.log('[gpx_detect] head (first 200 chars)=', head.slice(0, 200));
                      if (/<gpx[\s>]/i.test(head)) {
                          console.log('[gpx_detect] GPX detected, blocking');
                          alert('The uploaded file looks like a GPX file. Ropewiki only accepts KML files. Please re-export your map in KML format and try again.');
                          $input.val('');
                      } else {
                          console.log('[gpx_detect] looks like KML, allowing');
                      }
                  })
                  .catch(function (e) {
                      console.error('[gpx_detect] read failed', e);
                  });
          }, 0);
      });
  });
