import { useState, useRef } from 'react';
import styles from './UploadInterface.module.css';
import Body from './components/Body';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';

function GradientCircularProgress() {
  return (
    <div className={styles.loading}>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
    </div>
  );
}



const UploadInterface = () => {
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [audioSrc, setAudioSrc] = useState('http://localhost:5000/stream-audio');
  const [audioTSrc,setAudioTSrc] = useState('http://localhost:5000/stream-translation-audio');
  const [isDragging, setIsDragging] = useState(false);
  const [transcriptionTranslation,setTranscriptionTranslation] = useState("");
  const [summaryTranslation,setSummaryTranslation] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [language,setLanguage] = useState('Spanish');
  const [translationLanguage,setTranslationLanguage] = useState('Spanish');
  const [isSwitch,setIsSwitch] = useState(false)
  const audioRef = useRef(null);
  const audioTRef = useRef(null);




  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setTranscription('');
    setSummary('');
    setTranscriptionTranslation('');
    setSummaryTranslation('');
    setIsChecked(false)
    setIsSwitch(false);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      if (data.summarization) {
        setSummary(data.summarization);
      }
      setIsSwitch(true);
      const newSrc = `http://localhost:5000/stream-audio?timestamp=${Date.now()}`;
      setAudioSrc(newSrc);
      if (audioRef.current) {
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setTranscription('Error occurred while processing the file.');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleTranslate = async()=>{
    console.log(language)
    try{
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/translate?language=${language}`,{
        method: "GET",
      });
      const data = await response.json();
      console.log(data.transcriptionTranslation)
      setTranscriptionTranslation(data.transcriptionTranslation);
      console.log(data.summaryTranslation)
      setSummaryTranslation(data.summaryTranslation);
      setTranslationLanguage(language);
      setIsLoading(false);
      const newSrc = `http://localhost:5000/stream-translation-audio?timestamp=${Date.now()}`;
      setAudioTSrc(newSrc);
      if (audioTRef.current) {
        audioTRef.current.load();
      }

    }catch(error){
      console.log("Error in fetching Translation: ",error.message);
    }
  };


  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      setFile(droppedFile);
    }
  };

  const handleSwitchChange = (event) => {
    if(!fileName) {return}
    setIsChecked(event.target.checked); // Update state with the switch value
    console.log("Switch value:", event.target.checked); // Log the current value
    if(isChecked){
      return;
    }
    if(transcriptionTranslation && summaryTranslation){
      if(translationLanguage === language){
        return;
      }
      setTranscriptionTranslation("");
      setSummaryTranslation("");
      setTranslationLanguage("");
      setIsLoading(true)
    }
    handleTranslate();
  };

  const handleSelectChange = (event)=>{
    setLanguage(event.target.value)
    setIsChecked(false);
    console.log(event.target.value);


  }

  return (
    <div className={styles.container}>
      <main className={styles.child}>
        <div className={styles.description}>
          Upload a Video or an Audio file for summary.
        </div>
        <label
          htmlFor="file-upload"
          className={`${styles.uploadButton} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept="audio/mp3"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
          <span>Click to Select file </span>
        </label>
        {fileName && <div className={styles.fileName}>File Selected: {fileName}</div>}

        <Button 
          variant="contained" 
          endIcon={<CloudUploadIcon />}
          disabled={!file || isLoading}
          onClick={handleFileUpload}
          className={styles.button}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>


        <Box sx={{ minWidth: 120 }} className={styles.select}>
          <FormControl fullWidth>
            <InputLabel id="language-label">Language</InputLabel>
            <Select
              labelId="language-label"
              id="language-label-id"
              value={language}
              label="Age"
              onChange={handleSelectChange}
            >
              <MenuItem value={'Spanish'}>Spanish</MenuItem>
              <MenuItem value={"French"}>French</MenuItem>
              <MenuItem value={"Mandarin Chinese"}>Mandarin</MenuItem>
              <MenuItem value={"Hindi"}>Hindi</MenuItem>
              <MenuItem value={"Telugu"}>Telugu</MenuItem>
              <MenuItem value={"Tamil"}>Tamil</MenuItem>
              <MenuItem value={"Kanada"}>Kannada</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <FormControlLabel control={<Switch checked={isChecked} onChange={handleSwitchChange} disabled={!isSwitch}/>} label="Translate" className={styles.switch} />

        {isLoading && <GradientCircularProgress/>}

        {isChecked && transcriptionTranslation && (
          <Body transcription={transcriptionTranslation} summary={summaryTranslation} audioSrc={audioTSrc} audioRef={audioTRef}/>
        )}
        {!isChecked && transcription && (
          <Body transcription={transcription} summary={summary} audioSrc={audioSrc} audioRef={audioRef} />
        )}
      </main>
    </div>
  );
};

export default UploadInterface;
