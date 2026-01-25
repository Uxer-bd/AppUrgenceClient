import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonCardContent, IonList, IonItem, IonIcon, IonLabel, IonText
} from '@ionic/react';
import { globeOutline, shieldCheckmarkOutline, mailOutline, helpCircleOutline } from 'ionicons/icons';

const About: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/signaler-urgence" />
          </IonButtons>
          <IonTitle>À propos de Depannel Orit</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="ion-text-center ion-padding">
          <img src="Depannel.png" alt="Depannel Logo" style={{ width: '100px', borderRadius: '20px' }} />
          <h2 style={{ fontWeight: 'bold' }}>DEPANNEL</h2>
          <IonText color="medium">Version 1.0.0</IonText>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Notre Mission</IonCardSubtitle>
            <IonCardTitle>Urgence Électrique</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Depannel est une plateforme innovante conçue pour simplifier la mise en relation entre les clients ayant une urgence électrique et des électriciens qualifiés. 
            Nous garantissons une intervention rapide et sécurisée.
          </IonCardContent>
        </IonCard>

        <IonList lines="inset" className="ion-margin-top">
          <IonItem button onClick={() => window.open('https://www.depannel.com', '_blank')}>
            <IonIcon icon={globeOutline} slot="start" color="primary" />
            <IonLabel>Site Web Officiel</IonLabel>
          </IonItem>
          
          <IonItem button>
            <IonIcon icon={shieldCheckmarkOutline} slot="start" color="primary" />
            <IonLabel>Conditions Générales</IonLabel>
          </IonItem>

          <IonItem button href="mailto:contact@depannel.com">
            <IonIcon icon={mailOutline} slot="start" color="primary" />
            <IonLabel>Nous contacter</IonLabel>
          </IonItem>

          <IonItem button>
            <IonIcon icon={helpCircleOutline} slot="start" color="primary" />
            <IonLabel>FAQ</IonLabel>
          </IonItem>
        </IonList>

        <div className="ion-text-center ion-padding-top">
          <small style={{ color: '#999' }}>© 2026 Depannel Inc. Tous droits réservés.</small>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;