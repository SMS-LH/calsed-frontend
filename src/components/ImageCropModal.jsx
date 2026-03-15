import { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Loader2, X, Crop } from "lucide-react";

// Fonction utilitaire pour centrer le recadrage par défaut
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropModal = ({ imageSrc, aspect = 16 / 9, onClose, onComplete, isUploading }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Quand l'image est chargée, on définit la zone de recadrage par défaut
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  // Fonction magique pour extraire le morceau d'image sélectionné
  const getCroppedImg = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      completedCrop.width, completedCrop.height
    );

    // On convertit le canvas en Blob (Fichier)
    canvas.toBlob((blob) => {
      if (!blob) return;
      blob.name = "cropped_image.jpg";
      // On convertit le blob en un objet File classique pour l'upload
      const croppedFile = new File([blob], "cropped_image.jpg", { type: "image/jpeg", lastModified: Date.now() });
      onComplete(croppedFile);
    }, 'image/jpeg', 0.9); // 0.9 = Excellente qualité, compression légère
  };

  return (
    // CORRECTIONS ICI : z-[9999], pointer-events-auto, et stopPropagation()
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
      onPointerDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* En-tête */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-bold text-[#0A2A5C] flex items-center gap-2"><Crop className="h-5 w-5"/> Recadrer l'image</h3>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isUploading} className="text-slate-400 hover:text-red-500">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Zone de recadrage */}
        <div className="p-6 bg-slate-50 overflow-auto flex items-center justify-center min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="rounded-xl overflow-hidden shadow-sm"
          >
            <img 
              ref={imgRef} 
              src={imageSrc} 
              alt="À recadrer" 
              onLoad={onImageLoad} 
              className="max-h-[50vh] w-auto object-contain"
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white mt-auto">
          <Button variant="outline" onClick={onClose} disabled={isUploading} className="font-medium text-slate-600">
            Annuler
          </Button>
          <Button onClick={getCroppedImg} disabled={!completedCrop || isUploading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold min-w-[140px]">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
            {isUploading ? "Envoi..." : "Valider & Insérer"}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ImageCropModal;