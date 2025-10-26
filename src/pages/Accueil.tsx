import React from 'react';
import { IonContent, IonPage, IonButton, IonIcon, IonText } from '@ionic/react';
import { warningOutline, callOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Accueil: React.FC = () => {
  const history = useHistory();

  const handleSignaler = () => {
    history.push('/signale-urgence');
  };

  const handleAppeler = () => {
    window.location.href = 'tel:0800123456';
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f4f5f8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <div className="ion-text-center" style={{ marginBottom: '50px' }}>
            <h1 style={{ fontSize: '2em', fontWeight: 'bold', color: '#333' }}>Service d'Urgence Électrique</h1>
            <p style={{ fontSize: '1.2em', color: '#666' }}>Assistance 24h/24 - 7j/7</p>
          </div>

          <IonButton
            expand="block"
            size="large"
            style={{ '--background': '#ffc409', '--color': '#000', '--border-radius': '15px', height: '70px', textTransform: 'none', fontSize: '1.4em', fontWeight: 'bold' }}
            onClick={handleSignaler}
          >
            <IonIcon icon={warningOutline} slot="start" />
            Signaler une urgence
          </IonButton>

          <IonButton
            expand="block"
            size="large"
            className="ion-margin-top"
            style={{ '--background': '#3880ff', '--color': '#fff', '--border-radius': '15px', height: '70px', textTransform: 'none', fontSize: '1.4em', fontWeight: 'bold' }}
            onClick={handleAppeler}
          >
            <IonIcon icon={callOutline} slot="start" />
            Appeler maintenant
          </IonButton>

          <div className="ion-text-center" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
            <IonText style={{ color: '#666', fontSize: '1.1em' }}>
              <p>Numéro d'urgence : <strong>0800 123 456</strong></p>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Accueil;