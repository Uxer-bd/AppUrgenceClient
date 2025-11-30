import React, { useState } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonItem,
  IonLabel, IonInput, IonButton, IonGrid, IonRow, IonCol, useIonToast, IonTextarea
} from '@ionic/react';
// import { camera, } from 'ionicons/icons';
import { Zap, Gauge, Power, Cable, AlertCircle, MapPin } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { Geolocation, Position } from '@capacitor/geolocation';

const SignalerUrgence: React.FC = () => {

  const history = useHistory();
  const [present] = useIonToast();

  // États pour stocker les données du formulaire
  const [telephone, setTelephone] = useState('');
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [problemType, setProblemType] = useState<string | null>(null);
  const [description, setdescription] = useState('');
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [localisation, setLocalisation] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
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

    const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTlhMzljZC1hNzBiLTczODQtYWMxMy02ZGI0MzE1ZGFkNTMiLCJqdGkiOiIwMGFjMTk2YjMyZGUwYWEzOGM5MGIwMzJmMTMxODlmMDg1Mjg4NjM1NmI1MzQwZGJhYWRjYWQ1NWNjNWE5OWRmYTRhZGIzYjNiZTdjZDE3YSIsImlhdCI6MTc2MjExNDg0Ni4yOTE3OTIsIm5iZiI6MTc2MjExNDg0Ni4yOTE3OTQsImV4cCI6MTc3Nzc1MzI0Ni4yODY5ODYsInN1YiI6IjE0Iiwic2NvcGVzIjpbXX0.ggXQncl8Vr7Y1FQLc2tt0-7-hbyzw4TPifNqMnnhKL3HfMCovXAXhqVPKX9pEDDy4G00Yst30LMG5ZIEBcPlc2B5BvQliqi6oEOZmQO4dC0oqpcuA1e22a2fzOfbpyBylsN2-S8Zwl43PAD52sLJCc1AcMXzdfpMiMRMTjvJJlbKTrnmka4A7vpkZpWHA_F_Cv9In4NkalxESVH4zChDyqb7eXWJGlEvtAMinQN_ai6EnK3Uih-PhfWC6N55HNjpYN0bUO3mSNrJT2t52RjIs3ZCbuNgqqc9yMIe4Rnotdvt4O3K72EhruKo6SMgKtZM4PBffV7Afihf4wqZQ_FKedCCceW-JhUgsG_kk9sVaauFtNPh52g-NcIvBanSxvN9DrY7w7uFWH4yiaWU5G7gYFXZtPUJoIJyKbHbbikEceaGs9x82k0TaCgeco993dBq9EyFoAVXBUEcUfAI686Xt3R7_EKdwFYT6rmdVo2-22rYF_QXCAjyIQvD_xcbJK31W18cC8XaR3JXhowYSASGI-z6YAZ4Fl9w16-MQv_hm_5r8QD1R1ZpfYRnvz2yZdbPZABVQBwAMIg5hA_pvwLw5LTMeYrUN0tSzxLL4kvhK5VoNg3-Yhy5ckt_qMTIQ6U6o7sdz-a-MgvJKQSKKymjt2HrjzA8tIPoATN6XVEj6vI'
    const API_URL =  'https://intervention.tekfaso.com/api/interventions';
    // Création de l'objet contenant toutes les données
    // const urgenceData = {
    //   telephone,
    //   nom,
    //   adresse,
    //   type: problemType,
    //   description,
    //   position,
    // };

    const urgenceData = {
      problem_type_id : getProblemTypeId(problemType),
      title : problemType,
      description,
      address : adresse,
      latitude : position?.lat || 0,
      longitude : position?.lng || 0,
      priority_level : 'low',
      contact : telephone,
    };

    try {
      const response = await fetch(API_URL,{
        method : 'POST',
        headers : {
          'Content-type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : `Bearer ${TOKEN}`,
        },
        body : JSON.stringify(urgenceData)
      });

      if (!response.ok) {
        // Gérer les erreurs de l'API
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création de l\'intervention');
      }

      const responseData = await response.json();

      present({
        message: 'Déclaration envoyée avec succès !',
        duration: 2000,
        color: 'success'
      });

      // Rediriger vers la page de suivi (passer les données reçues si nécessaire)
      history.push(`/suivie-urgence/${ responseData.data.id }`, { urgenceData: responseData.data });

    } catch(error: unknown) {
      present({
        message: error instanceof Error ? error.message : 'Une erreur est survenue.',
        duration: 3000,
        color: 'danger'
      })
    }
};

  const buttonStyle = (type: string) => {
    const style: Record<string, string | number | undefined> = {
      borderRadius: '10px',
      height: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textTransform: 'none',
      // Slight visual lift when selected
      boxShadow: problemType === type ? '0 2px 6px rgba(0,0,0,0.15)' : undefined,
    };
    // Use Ionic CSS variables so the IonButton respects the colors
    style['--background'] = problemType === type ? '#adcbffff' : '#f4f5f8';
    style['--color'] = problemType === type ? '#000' : '#666';
    return style as React.CSSProperties;
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      // 1. Demander la permission et obtenir la position
      const currentPosition: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Utiliser le GPS si disponible
        timeout: 10000,
      });

      const lat = currentPosition.coords.latitude;
      const lng = currentPosition.coords.longitude;

      // 2. Mettre à jour l'état local
      setPosition({ lat, lng });

      // 3. Afficher la localisation dans le champ Adresse (pour l'utilisateur)
      const locationString = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      setLocalisation(locationString);

      // 4. Message de succès
      present({
        message: 'Localisation GPS récupérée avec succès.',
        duration: 2000,
        color: 'success'
      });

    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      // 5. Message d'erreur
      present({
        message: 'Impossible de récupérer la localisation. Veuillez vérifier les permissions.',
        duration: 3000,
        color: 'danger'
      });
      // Effacer l'adresse si une erreur survient
      setAdresse('');
    } finally {
      setIsLocating(false);
    }
  };

  const getProblemTypeId = (problemName: string): number => {
    switch (problemName) {
      case 'Panne Courant': return 1;
      case 'Compteur': return 2;
      case 'Câble Endommagé': return 3;
      case 'Autre Urgence': return 4;
      case 'Cours-circuit': return 5;
      default: return 0; // Un ID par défaut
    }
  };


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
            <IonLabel position="floating" style={{ marginBottom : '15px' }}>Votre adresse (lieu d'intervention)</IonLabel>
            <IonInput
              type="text"
              placeholder="Votre adresse"
              value={adresse}
              onIonChange={e => setAdresse(e.detail.value!)}
            ></IonInput>
          </IonItem>
          <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px' }}>Ma Localisation exacte</IonLabel>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <IonItem lines="full" style={{
                '--background': '#f2f2f7',
                '--border-radius': '10px',
                '--padding-start': '10px',
                flexGrow: 1,
                marginRight: '10px',
                height: '50px'
            }}>
              <IonInput
                value={localisation}
                onIonChange={e => setLocalisation(e.detail.value!)}
                placeholder="Partager ma position exacte"
                required
                style={{ '--padding-start': '0px', '--padding-end': '0px' }} // Supprimer les padding par défaut d'IonInput
              />
            </IonItem>
            <IonButton
              onClick={handleGetLocation}
              disabled={isLocating}
              style={{
                '--background': '#3880ff',
                '--border-radius': '10px',
                height: '50px',
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              >
              {isLocating ? (
                <span style={{color: 'white'}}>...</span>
              ) : (
                <MapPin size={24} color="white" />
              )}
            </IonButton>
          </div>

          <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>Type de problème *</IonLabel>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonButton type="button" expand="block" style={buttonStyle('Panne Courant')} onClick={() => setProblemType('Panne Courant')} aria-pressed={problemType === 'Panne Courant'}>
                  {/* <IonIcon icon={Power} style={{ fontSize: '2em' }} /> */}
                  <Power style={{ fontSize: '2em' }} />
                  <IonLabel>Panne Courant</IonLabel>
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton type="button" expand="block" style={buttonStyle('Compteur')} onClick={() => setProblemType('Compteur')} aria-pressed={problemType === 'Compteur'}>
                  <Gauge style={{ fontSize: '2em' }} />
                  <IonLabel>Compteur</IonLabel></IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonButton type="button" expand="block" style={buttonStyle('Cours-circuit')} onClick={() => setProblemType('Cours-circuit')} aria-pressed={problemType === 'Cours-circuit'}>
                  <Zap style={{ fontSize: '2em' }} />
                  <IonLabel>Cours-circuit</IonLabel></IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton type="button" expand="block" style={buttonStyle('Câble Endommagé')} onClick={() => setProblemType('Câble Endommagé')} aria-pressed={problemType === 'Câble Endommagé'}>
                  <Cable style={{ fontSize: '2em' }} />
                  <IonLabel>Câble Endommagé</IonLabel></IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="6">
                <IonButton type="button" expand="block" style={buttonStyle('Autre urgence')} onClick={() => setProblemType('Autre urgence')} aria-pressed={problemType === 'Autre urgence'}>
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

          {/* <IonButton expand="block" fill="outline" className="ion-margin-top" style={{ '--border-radius': '10px', color: '#666' }}>
            <IonIcon icon={camera} slot="start"/>
            Ajouter une photo (optionnel)
          </IonButton> */}

          <IonButton type="submit" expand="block" size="large" className="ion-margin-top" style={{ '--background': '#ffc409', '--color': '#000', '--border-radius': '10px', height: '50px', textTransform: 'none', fontSize: '1.2em', fontWeight: 'bold' }}>
            Envoyer la déclaration
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default SignalerUrgence;