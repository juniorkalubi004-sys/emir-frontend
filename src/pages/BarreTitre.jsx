
import "./titlebar.css";

export default function TitleBar() {
  return (
  
   <div className="titlebar">
     
      {/* LEFT */}
    
      {/* CENTER (drag zone) */}
      <div className="drag-region"></div>
      {/* RIGHT */}
      <div className="titlebar-right">
        <button onClick={() => window.electronAPI.minimize()}>─</button>
        <button onClick={() =>window.electronAPI.maximize()}>▢</button>
        <button className="close" onClick={() =>window.electronAPI.close()}>✕</button>
      </div>
    </div>
  );
}
