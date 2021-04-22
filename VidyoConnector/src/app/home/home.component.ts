import { Component, OnInit, Output } from '@angular/core';
import { LocalWindowShare } from '../model/local-window-share';
import { ScriptService } from '../service/script-service.service';

declare var RegisterLoadEventCallback: any;

declare var RegisterShareListener: any;
declare var SelectLocalWindowShare: any;

declare var VidyoClientLoaded: any;
declare var vidyoConnector: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public PORTAL = '*';
  public ROOM_KEY = '*'; // default room id
  public DISPLAY_NAME = 'Angular User'; // default username
  public ROOM_PIN = ''; // default room pin

  /* Preview button display toggle control */
  public cameraPrivacy: boolean = false;

  /* Mute button display toggle control */
  public microphonePrivacy: boolean = false;

  /* Call Connect button display toggle control */
  public connected: boolean = false;

  public userName = this.DISPLAY_NAME;

  public connectionStatus = 'Awaiting connection';

  @Output()
  public localWindowShares = Array<LocalWindowShare>();

  @Output()
  public isSharingWindow: boolean = false;

  constructor(private readonly scriptService: ScriptService) {}

  ngOnInit(): void {
    /* Pass the callback to JS layer */
    RegisterLoadEventCallback(this.OnVidyoClientLoadCallback);

    this.scriptService
      .load('VidyoClient')
      .then((data: any) => {
        console.log('@Script loaded ', data[0]);

        if (!data[0].loaded) {
          console.error('Lib has not loaded.');
          return;
        }

        VidyoClientLoaded({
          state: 'READY',
          description: 'Native SCIP + WebRTC',
        });
      })
      .catch((error) => console.log(error));
  }

  private OnVidyoClientLoadCallback: Function = (status: boolean) => {
    console.log('VidyoClient load status: ' + status);

    /* Register all the listeners */
    this.registerCameraEventListener();
    this.registerMicrophoneEventListener();
    this.registerLocalSpeakerEventListener();

    RegisterShareListener(this.OnVidyoClientShareCallback);

    vidyoConnector
      .GetVersion()
      .then(function (version: string) {
        console.log('Library Version: ' + version);
      })
      .catch(function () {
        console.error('GetVersion failed');
      });
  };

  /* Custom Share Callback from JS Share Event Listener */
  private OnVidyoClientShareCallback: Function = (
    localWindowShare: any,
    action: any
  ) => {
    console.log('Share callback with action: $' + action);

    switch (action) {
      case 'add':
        var localShare = new LocalWindowShare(localWindowShare);
        this.localWindowShares.push(localShare);
        console.log('Add: Shares size: ' + this.localWindowShares.length);
        break;
      case 'remove':
        var index = this.localWindowShares.findIndex(
          (el) => el.getObject() === localWindowShare
        );

        if (index !== -1) {
          this.localWindowShares.splice(index, 1);
        }

        console.log('Remove: Shares size: ' + this.localWindowShares.length);
        this.isSharingWindow = false;
        break;
      case 'started':
        this.isSharingWindow = true;
        console.log('Share has started. Name: ' + localWindowShare.name);
        break;
      case 'stopped':
        this.isSharingWindow = false;
        console.log('Share was stopped. Drop to none selection.');
        break;
    }
  };

  public onShareSelected(event: any) {
    const value = event.target.value;
    console.log("To select: " + value.name);

    SelectLocalWindowShare(value == 'None' ? null : value);
  }

  /**
   * It will connect to the video call using VidyoConnector#Connect api.
   */
  startVideoCall() {
    this.connectionStatus = 'Connecting';

    if (this.DISPLAY_NAME != '' && this.PORTAL != '' && this.ROOM_KEY != '') {
      vidyoConnector
        .ConnectToRoomAsGuest({
          host: this.PORTAL,
          roomKey: this.ROOM_KEY,
          displayName: this.DISPLAY_NAME,
          roomPin: this.ROOM_PIN,

          onSuccess: () => {
            console.log('Connected');
            this.connected = true;

            this.updateStatus('Connected');
          },
          onFailure: (reason: any) => {
            this.connected = false;
            console.error('Connection Failed : ', reason);

            this.updateStatus('Connection failed');
          },
          onDisconnected: (reason: any) => {
            this.connected = false;
            console.log('Connection Disconnected - ' + reason);
            this.updateStatus('Disconnected');
          },
        })
        .then((status: any) => {
          if (status) {
            this.connected = true;
          }
        })
        .catch(() => {
          console.log('Connect Error');
          this.updateStatus('Connection failed');
        });
    } else {
      this.updateStatus('Missing credentials.');
    }
  }

  /**
   * Toggles the preview button/functionality
   */
  togglePreview() {
    this.cameraPrivacy = !this.cameraPrivacy;
    console.log(`Toggle Preview to: ${this.cameraPrivacy}`);

    vidyoConnector
      .SetCameraPrivacy({
        privacy: this.cameraPrivacy,
      })
      .then(function () {
        console.log('SetCameraPrivacy Success');
      })
      .catch(function () {
        console.error('SetCameraPrivacy Failed');
      });
  }

  /**
   * Toggles the mic button/functionality
   */
  toggleMic() {
    this.microphonePrivacy = !this.microphonePrivacy;
    console.log(`Toggle mic muted to: ${this.microphonePrivacy}`);

    vidyoConnector
      .SetMicrophonePrivacy({
        privacy: this.microphonePrivacy,
      })
      .then(function () {
        console.log('SetMicrophonePrivacy Success');
      })
      .catch(function () {
        console.error('SetMicrophonePrivacy Failed');
      });
  }

  /**
   * Toggles the video call button/functionality
   */
  toggleConnect() {
    if (this.connected) {
      console.debug('Disconnecting video call');
      vidyoConnector.Disconnect();

      this.updateStatus('Disconnecting...');
    } else {
      this.startVideoCall();
    }
  }

  private updateStatus(status: string) {
    this.connectionStatus = status;
  }

  registerCameraEventListener() {
    vidyoConnector
      .RegisterLocalCameraEventListener({
        onAdded: (localCamera: any) => {
          console.log('Added camera:' + localCamera.name);
        },
        onRemoved: (localCamera: any) => {},
        onSelected: (localCamera: any) => {
          console.log('Local camera selected: ' + localCamera.name);
        },
        onStateUpdated: (localCamera: any, state: any) => {},
      })
      .then(() => {
        console.log('RegisterLocalCameraEventListener Success');
      })
      .catch(() => {
        console.error('RegisterLocalCameraEventListener Failed');
      });
  }

  registerMicrophoneEventListener() {
    vidyoConnector
      .RegisterLocalMicrophoneEventListener({
        onAdded: (localMicrophone: any) => {
          console.log('Added microphone:' + localMicrophone.name);
        },
        onRemoved: (localMicrophone: any) => {
          console.log('Removed microphone:' + localMicrophone.name);
        },
        onSelected: (localMicrophone: any) => {
          if (localMicrophone) {
            console.log('Selected microphone:' + localMicrophone.name);
          }
        },
        onStateUpdated: (localMicrophone: any, state: any) => {
          if (localMicrophone) {
            console.log(
              'Microphone updated:' + localMicrophone.name + ', State: ' + state
            );
          }
        },
      })
      .then(function () {
        console.log('RegisterLocalMicrophoneEventListener Success');
      })
      .catch(function () {
        console.error('RegisterLocalMicrophoneEventListener Failed');
      });
  }

  private registerLocalSpeakerEventListener() {
    vidyoConnector
      .RegisterLocalSpeakerEventListener({
        onAdded: (localSpeaker: any) => {
          console.log('Added speaker:' + localSpeaker.name);
        },
        onRemoved: (localSpeaker: any) => {
          console.log('Removed speaker:' + localSpeaker.name);
        },
        onSelected: (localSpeaker: any) => {
          if (localSpeaker) {
            console.log('Speaker updated:' + localSpeaker.name);
          }
        },
        onStateUpdated: (localSpeaker: any, state: any) => {
          if (localSpeaker) {
            console.log(
              'Selected speaker:' + localSpeaker.name + ', State: ' + state
            );
          }
        },
      })
      .then(function () {
        console.log('RegisterLocalSpeakerEventListener Success');
      })
      .catch(function () {
        console.error('RegisterLocalSpeakerEventListener Failed');
      });
  }

  private isSafari() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') > -1) {
        return false;
      }
      return true;
    }
    return false;
  }
}
