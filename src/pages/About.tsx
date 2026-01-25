import React from 'react';
import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonList, IonItem, IonIcon, IonLabel, IonText, IonListHeader, 
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
          <IonTitle>À propos de Depannel</IonTitle>
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
            <IonCardTitle>Qui sommes nous ?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Nous sommes le meilleur SERVICE DE DEPANNAGE spécialisé dans le domaine de l’électricité fondé par le groupe ELECTRICAL ENGENEERING UNIT.
            Notre réseau de techniciens très efficaces et très polyvalents nous permet d’intervenir avec rapidité et professionnalisme au bonheur de nos clients. 
            Notre particularité réside dans la fluidité de nos interventions avec notre merveilleuse plateforme disponible 24H/24 -7j/7 qui vous permet de signaler 
            votre préoccupation et de suivre l’évolution de votre besoin sans vous déplacer, de l’affectation d’un technicien spécialisé à la résolution de votre préoccupation. 
          </IonCardContent>
        </IonCard>

        <IonList lines="full" className="ion-margin-top">
        <IonListHeader>
          <IonLabel color="primary" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
            Nos Services
          </IonLabel>
        </IonListHeader>

        <IonItem>
          <IonLabel>
            <h2>Dépannage électricité Bâtiment </h2>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <h2>Dépannage électroménager </h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage électronique et informatique</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage froid et climatisation </h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage électricité industrielle</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage groupe électrogène</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage installation solaire </h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Dépannage divers </h2>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonCard>
          <IonCardHeader>
            {/* <IonCardSubtitle>Notre Mission</IonCardSubtitle> */}
            <IonCardTitle>Le Groupe E1'ing</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            ELECTRICAL ENGINEERING UNIT (E1’ING) est une société experte en énergie et solutions électriques installé au Burkina Faso depuis 2019 par un groupe de jeunes ingénieurs de plusieurs domaines dont l’électricité, l’électronique et l’information et l’électromécanique. 
            Sa particularité réside dans l’agilité de ses équipes, la force de sa jeunesse, et l’innovation dans la fourniture de solutions et de services dans de l’électricité.
            En si peu de temps, E1’ING s’est fait connaitre dans le secteur de l’électricité industrielle grâce au dynamisme de son personnel, à la qualité de ses fournitures strictement conformes aux normes internationales, 
            À la rigueur dans ses installations, et aux brassages des innovations 
            Multidisciplinaires : électricité, électronique, et mécaniques.
            Ainsi, elle a participé à des projets d’envergures 	au Burkina Faso. Son siège est à Bobo Dioulasso et représenté dans la plupart des grandes villes du pays.

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