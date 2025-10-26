import React, { useState } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonItem,
  IonLabel, IonInput, IonButton, IonIcon, IonGrid, IonRow, IonCol, useIonToast, IonTextarea
} from '@ionic/react';
import { camera, locate, } from 'ionicons/icons';
import { Zap, Gauge, Power, Cable, AlertCircle } from 'lucide-react';
import { useHistory } from 'react-router-dom';

const SignalerUrgence: React.FC = () => {

  const history = useHistory();
  const [present] = useIonToast();

  // États pour stocker les données du formulaire
  const [telephone, setTelephone] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [problemType, setProblemType] = useState<string | null>(null);
  const [description, setdescription] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Vérification simple que le type de problème est sélectionné
    if (!problemType) {
      present({
        message: 'Veuillez sélectionner un type de problème.',
        duration: 2000,
        color: 'danger'
      });
      return;
    }

    // Création de l'objet contenant toutes les données
    const urgenceData = {
      telephone,
      nom,
      adresse,
      type: problemType,
      description,
    };

    // Navigation vers la page de suivi en passant les données
    history.push('/suivie-urgence', { urgenceData });
  };



  const buttonStyle = (type: string) => ({
    '--border-color': problemType === type ? '#3880ff' : '#ddd',
    '--border-width': problemType === type ? '2px' : '1px',
    '--background': problemType === type ? 'rgba(56, 128, 255, 0.1)' : '#fff',
    '--color': '#333',
    '--border-radius': '10px',
    '--box-shadow': 'none',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'none'
  });


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Déclaration d'Urgence</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Lier les inputs aux états avec `value` et `onIonChange` */}
        <form onSubmit={handleSubmit}>
          <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
            <IonLabel position="floating" style={{ marginBottom : '15px' }}>Téléphone *</IonLabel>
            <IonInput
              type="tel"
              value={telephone}
              onIonChange={e => setTelephone(e.detail.value!)}
              required
            ></IonInput>
          </IonItem>
          <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
            <IonLabel position="floating" style={{ marginBottom : '15px' }}>Nom (optionnel)</IonLabel>
            <IonInput
              type="text"
              placeholder="Votre nom"
              value={nom}
              onIonChange={e => setNom(e.detail.value!)}
            ></IonInput>
          </IonItem>
          <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
            <IonLabel position="floating" style={{ marginBottom : '15px' }}>Adresse</IonLabel>
            <IonInput
              type="text"
              placeholder="Entrez votre adresse"
              value={adresse}
              onIonChange={e => setAdresse(e.detail.value!)}
            ></IonInput>
            <IonButton slot="end" fill="clear">
              <IonIcon icon={locate} />
              GPS
            </IonButton>
          </IonItem>

          <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>Type de problème *</IonLabel>
          <IonGrid>
            <IonRow>
              <IonCol size="3">
                <IonButton color='light' expand="block" style={buttonStyle('Panne Courant')} onClick={() => setProblemType('Panne Courant')}>
                  {/* <IonIcon icon={Power} style={{ fontSize: '2em' }} /> */}
                  <Power style={{ fontSize: '2em' }} />
                  <IonLabel>Panne Courant</IonLabel>
                </IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton color='light' expand="block" style={buttonStyle('Compteur')} onClick={() => setProblemType('Compteur')}>
                  <Gauge style={{ fontSize: '2em' }} />
                  <IonLabel>Compteur</IonLabel></IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton color='light' expand="block" style={buttonStyle('cour-circuit')} onClick={() => setProblemType('Cours-circuit')}>
                  <Zap style={{ fontSize: '2em' }} />
                  <IonLabel>Cours-circuit</IonLabel></IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton color='light' expand="block" style={buttonStyle('Câble Endommagé')} onClick={() => setProblemType('Câble Endommagé')}>
                  <Cable style={{ fontSize: '2em' }} />
                  <IonLabel>Câble Endommagé</IonLabel></IonButton>
              </IonCol>
              <IonCol size="3">
                <IonButton color='light' expand="block" style={buttonStyle('Autre urgence')} onClick={() => setProblemType('Autre urgence')}>
                  <AlertCircle style={{ fontSize: '2em' }} />
                  <IonLabel>Autre Urgence</IonLabel></IonButton>
              </IonCol>
            </IonRow>
            {/* ... autres boutons de problème ... */}
          </IonGrid>

          <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
            <IonLabel position="floating" style={{ marginBottom : '15px' }}>Description (optionnel)</IonLabel>
            <IonTextarea
              placeholder="Décrivez le problème"
              autoGrow={true}
              value={description}
              onIonChange={e => setdescription(e.detail.value!)}
            ></IonTextarea>
          </IonItem>

          <IonButton expand="block" fill="outline" className="ion-margin-top" style={{ '--border-radius': '10px', color: '#666' }}>
            <IonIcon icon={camera} slot="start"/>
            Ajouter une photo (optionnel)
          </IonButton>

          <IonButton type="submit" expand="block" size="large" className="ion-margin-top" style={{ '--background': '#ffc409', '--color': '#000', '--border-radius': '10px', height: '50px', textTransform: 'none', fontSize: '1.2em', fontWeight: 'bold' }}>
            Envoyer la déclaration
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default SignalerUrgence;