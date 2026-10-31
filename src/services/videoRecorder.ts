import { studioAudio } from "../audio/audioEngine";

export class RTVideoRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  public startRecording(
    canvas: HTMLCanvasElement,
    fps: number = 30
  ): boolean {
    if (this.isRecording) return false;
    this.recordedChunks = [];

    try {
      // 1. Capture canvas stream
      const canvasStream = canvas.captureStream(fps);

      // 2. Capture mixed audio stream from Web Audio API
      const audioStream = studioAudio.getMediaStream();

      // Combined stream
      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
      }

      // Check supported mime types
      let mimeType = "video/webm;codecs=vp9,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8,opus";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/mp4";
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 4000000, // 4 Mbps high quality
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      recorder.onstart = () => {
        this.isRecording = true;
      };

      recorder.onstop = () => {
        this.isRecording = false;
      };

      this.mediaRecorder = recorder;
      recorder.start(250); // collect chunks every 250ms
      return true;
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      return false;
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.recordedChunks.length === 0) {
          resolve(null);
          return;
        }

        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder?.mimeType || "video/webm",
        });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  public async downloadVideo(blob: Blob, filename = "RT-Lab-21st-Anniversary-Custom.mp4") {
    const isMobile =
      typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const isMp4 = blob.type.includes("mp4");
    const ext = isMp4 ? "mp4" : "webm";
    const actualFilename = filename.replace(/\.(webm|mp4)$/i, "") + `.${ext}`;

    try {
      if (isMobile && navigator.canShare) {
        const file = new File([blob], actualFilename, { type: blob.type || "video/mp4" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "إعلان معامل رامي مختار RT",
            text: "فيديو المشاهد المخصصة - معامل رامي مختار RT للتحاليل الطبية",
            files: [file],
          });
          return;
        }
      }
    } catch (e) {
      console.warn("Mobile share not completed, falling back to blob URL:", e);
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = actualFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const videoRecorder = new RTVideoRecorderService();
