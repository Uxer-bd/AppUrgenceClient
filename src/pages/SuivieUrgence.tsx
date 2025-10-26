import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonLabel,
  IonButton,
} from '@ionic/react';
import {
  checkmarkCircle,
  ellipse,
  timeOutline,
  buildOutline,
  call,
  text,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

// Interface pour décrire la structure des données de l'urgence
interface UrgenceData {
  telephone: string;
  nom: string;
  adresse: string;
  type: string;
  description: string;
}

// On rend `urgenceData` optionnel avec `?` pour que TypeScript ne se plaigne pas
interface LocationState {
  urgenceData?: UrgenceData;
}

const SuivieUrgence: React.FC = () => {
  // On récupère l'objet `location` qui contient notre `state`
  const location = useLocation<LocationState>();

  // On extrait les données de manière sûre.
  // `location.state?.urgenceData` utilise le "chaînage optionnel" :
  // si `location.state` n'existe pas, l'expression renvoie `undefined` sans planter.
  // L'opérateur `||` fournit ensuite un objet par défaut si rien n'a été trouvé.
  const urgenceData = location.state?.urgenceData || {
    telephone: 'Non fourni',
    nom: 'Non fourni',
    adresse: 'Non fournie',
    type: 'Non défini',
    description: 'Non fournie',
  };

  const statusSteps = [
    { name: 'Réceptionnée', icon: checkmarkCircle, status: 'Terminé', active: true },
    { name: 'Agent Affecté', icon: ellipse, status: 'En cours...', active: true },
    { name: 'En Route', icon: ellipse, status: '', active: false },
    { name: 'Arrivé', icon: timeOutline, status: '', active: false },
    { name: 'Terminée', icon: buildOutline, status: '', active: false },
  ];

  const handleAppeler = () => {
    window.location.href = 'tel:0800123456';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Suivi de votre intervention</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f4f5f8' }}>
        {/* Card: Votre demande - Données affichées dynamiquement */}
        <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <IonCardContent>
            <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Votre demande</h2>
            <p>
              <strong>Type :</strong> {urgenceData.type}
            </p>
            <p>
              <strong>Description :</strong> {urgenceData.description}
            </p>
            <p>
              <strong>Téléphone :</strong> {urgenceData.telephone}
            </p>
            <p>
              <strong>Nom :</strong> {urgenceData.nom || 'Non renseigné'}
            </p>
            <p>
              <strong>Adresse :</strong> {urgenceData.adresse || 'Non renseignée'}
            </p>
          </IonCardContent>
        </IonCard>

        {/* Card: Statut de l'intervention */}
        <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <IonCardContent>
            <h2 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Statut de l'intervention</h2>
            {statusSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                  opacity: step.active ? 1 : 0.4,
                }}
              >
                <IonIcon
                  icon={step.icon}
                  style={{
                    color: step.name === 'Réceptionnée' ? '#2dd36f' : '#3880ff',
                    fontSize: '2em',
                    marginRight: '15px',
                  }}
                />
                <div>
                  <IonLabel style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                    {step.name}
                  </IonLabel>
                  {step.status && <p style={{ color: '#666', margin: 0 }}>{step.status}</p>}
                </div>
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        {/* Card: Technicien assigné */}
        <IonCard style={{ borderRadius: '15px', '--background': '#eef5ff', boxShadow: 'none' }}>
          <IonCardContent>
            <h3 style={{ fontWeight: 'bold' }}>Technicien assigné</h3>
            <p>Bernard</p>
            <p style={{ color: '#666' }}>Badge #12345</p>
          </IonCardContent>
        </IonCard>

        {/* Section: Aide immédiate */}
        <div
          style={{
            marginTop: '20px',
            border: '1px solid #ff4961',
            borderRadius: '15px',
            padding: '10px',
          }}
        >
          <p className="ion-text-center" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Besoin d'aide immédiate ?
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <IonButton
              style={{ '--background': '#eb445a', '--border-radius': '10px', flex: 1, marginRight: '5px' }}
              onClick={handleAppeler}
            >
              <IonIcon slot="start" icon={call} />
              Appeler
            </IonButton>
            <IonButton
              fill="outline"
              style={{
                '--border-color': '#ff0123ff',
                '--color': '#fcb0baff',
                '--border-radius': '10px',
                flex: 1,
                marginLeft: '5px',
              }}
            >
              <IonIcon slot="start" icon={text} />
              SMS
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SuivieUrgence;