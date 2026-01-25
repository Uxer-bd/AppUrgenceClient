import React from 'react';
import { IonContent, IonPage, IonButton, IonIcon, IonText, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/react';
import { warningOutline, callOutline, briefcaseOutline, informationCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
// import { AlignCenter } from 'lucide-react';

const Accueil: React.FC = () => {
  const history = useHistory();

  const handleSignaler = () => {
    history.push('/signale-urgence');
  };

  const handleAppeler = () => {
    window.location.href = 'tel:74213460';
  };

  const recrutement = () => {
    window.location.href = 'https://tally.so/r/1A9A61';
  };

  return (
    <IonPage>
      <IonHeader>
          <IonToolbar color="primary">
              <IonTitle>DEPANNEL</IonTitle>
              <IonButtons slot="end" style={{ marginRight: "20px" }} onClick={() => history.push('/about')}>
                  <IonIcon slot="icon-only" icon={informationCircleOutline} />
                  A propos
              </IonButtons>
          </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f4f5f8', display: 'flex', flexDirection: 'column', justifyContent: 'center', AlignCenter: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
          <div className="ion-text-center" style={{ marginBottom: '50px' }}>
            <h1 style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>Service de dépannage et d'urgence électrique</h1>
            <p style={{ fontSize: '1.2em', color: '#666' }}>Assistance 24h/24 - 7j/7</p>
          </div>

          <IonButton
            expand="block"
            size="large"
            style={{ '--background': '#ffc409', '--color': '#000', '--border-radius': '15px', height: '100px', width:'70%', textTransform: 'none', fontSize: '1.4em', fontWeight: 'bold' }}
            onClick={handleSignaler}
          >
            <IonIcon icon={warningOutline} slot="start" />
            Signaler une panne
          </IonButton>

          <IonButton
            expand="block"
            size="large"
            className="ion-margin-top"
            style={{ '--background': '#3880ff', '--color': '#fff', '--border-radius': '15px', height: '100px', width:'70%', textTransform: 'none', fontSize: '1.4em', fontWeight: 'bold' }}
            onClick={handleAppeler}
          >
            <IonIcon icon={callOutline} slot="start" />
            Appeler maintenant
          </IonButton>
          <IonButton
            expand="block"
            size="large"
            className="ion-margin-top"
            style={{ '--background': '#bababa', '--color': '#000000', '--border-radius': '15px', height: '100px', width:'70%', textTransform: 'none', fontSize: '1.4em', fontWeight: 'bold' }}
            onClick={recrutement}
          >
            <IonIcon icon={briefcaseOutline} slot="start" />
            Recrutement
          </IonButton>

          <div className="ion-text-center" style={{ marginTop: '30px', paddingBottom: '20px' }}>
            <IonText style={{ color: '#666', fontSize: '1.1em' }}>
              <p>Numéro d'urgence : <strong>+226 74213460</strong></p>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Accueil;