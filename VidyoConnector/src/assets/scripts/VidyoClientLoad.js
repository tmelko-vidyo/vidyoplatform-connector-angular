var vidyoConnector;

var onVidyoClientLoadedCallback;

var onShareCallback;

function RegisterLoadEventCallback(callback) {
  this.onVidyoClientLoadedCallback = callback;
}

function VidyoClientLoaded(status) {
  console.log("Status: " + status.state + "Description: " + status.description);

  switch (status.state) {
    case "READY":
      window.VC = new window.VidyoClientLib.VidyoClient("", () => {
        VC.CreateVidyoConnector({
          viewId: "connected-video-chat",
          viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default",
          remoteParticipants: 8,
          logFileFilter: "warning error all@VidyoConnector info@VidyoClient",
          logFileName: "VidyoClientLog.log",
          userData: "",
        })
          .then((vc) => {
            console.log("VidyoClient Success", vc);
            vidyoConnector = vc;

            /* Notify Angular layer about successful load event */
            if (this.onVidyoClientLoadedCallback != null) {
              this.onVidyoClientLoadedCallback(true);
            } else {
              console.log("Callback is not available.");
            }
          })
          .catch((error) => {
            console.log("VidyoClient failed", error);
            onVidyoClientLoaded(status);
          });
      });
      break;
    case "RETRYING": // The library operating is temporarily paused
      console.log("RETRYING");
      break;
    case "FAILED": // The library operating has stopped
      console.log("FAILED");
      this.onVidyoClientLoadedCallback(false);
      break;
    case "FAILEDVERSION":
      console.log("FAILEDVERSION");
      this.onVidyoClientLoadedCallback(false);
      break;
    case "NOTAVAILABLE": // The library is not available
      console.log("NOTAVAILABLE");
      this.onVidyoClientLoadedCallback(false);
      break;
  }
  return true; // Return true to reload the plugins if not available
}

function RefreshView() {
  var rndr = document.getElementById("connected-video-chat");
  vidyoConnector.ShowViewAt({
    viewId: "connected-video-chat",
    x: rndr.offsetLeft,
    y: rndr.offsetTop,
    width: rndr.offsetWidth,
    height: rndr.offsetHeight,
  });
  console.log(
    "Show View At called: " +
      rndr.offsetLeft +
      ", " +
      rndr.offsetTop +
      ", " +
      rndr.offsetWidth +
      ", " +
      rndr.offsetHeight
  );
}

function SelectLocalWindowShare(share) {
  vidyoConnector
    .SelectLocalWindowShare({
      localWindowShare: share,
    })
    .then(function (isSelected) {
      if (!isSelected) {
        console.log("Share has not been selected");
        this.onShareCallback(null, "stopped");
      } else {
        console.log("SelectLocalWindowShare Success");
      }
    })
    .catch(function (error) {
      // This API will be rejected in case any error occurred including:
      // - permission is not given on the OS level (macOS).
      console.error("SelectLocalWindowShare Failed:", error);
    });
}

function RegisterShareListener(callback) {
  this.onShareCallback = callback;

  vidyoConnector
    .RegisterLocalWindowShareEventListener({
      onAdded: function (localWindowShare) {
        // New share is available so add it to the windowShares array and the drop-down list
        if (localWindowShare.name != "") {
          this.onShareCallback(localWindowShare, "add");
        }
      },
      onRemoved: function (localWindowShare) {
        this.onShareCallback(localWindowShare, "remove");
      },
      onSelected: function (localWindowShare) {
        // Share was selected/unselected by you or automatically
        if (localWindowShare) {
          console.log("Window share selected: " + localWindowShare.name);
          this.onShareCallback(localWindowShare, "started");
        } else {
          console.log("Local window share was likely unselected or stopped.");
          this.onShareCallback(null, "stopped");
        }
      },
      onStateUpdated: function (localWindowShare, state) {},
    })
    .then(function () {
      console.log("RegisterLocalWindowShareEventListener Success");
    })
    .catch(function () {
      console.error("RegisterLocalWindowShareEventListener Failed");
    });
}
