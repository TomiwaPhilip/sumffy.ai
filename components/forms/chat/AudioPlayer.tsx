const AudioPlayer = ({ audioUrl }: {audioUrl: string | undefined}) => {
    return (
      <audio
        controls
        src={audioUrl}
        className="custom-audio"
      >
        Your browser does not support the audio element.
      </audio>
    );
  };
  
  export default AudioPlayer;
  