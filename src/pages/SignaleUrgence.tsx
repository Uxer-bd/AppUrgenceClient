import React, { useState } from 'react';
import {
    IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonItem,
    IonLabel, IonInput, IonButton, IonGrid, IonRow, IonCol, useIonToast, IonLoading
} from '@ionic/react';
import { MapPin } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { Geolocation, Position } from '@capacitor/geolocation';

// Clés pour le stockage local (Bonne pratique)
const REPORTER_PHONE_KEY = 'reporter_phone';
const REPORTER_NAME_KEY = 'reporter_name';

const SignalerUrgence: React.FC = () => {

    const history = useHistory();
    const [present] = useIonToast();

    // 1. INITIALISATION : Charger les valeurs depuis localStorage
    const [telephone, setTelephone] = useState(() => localStorage.getItem(REPORTER_PHONE_KEY) || '');
    // const [nom, setNom] = useState(() => localStorage.getItem(REPORTER_NAME_KEY) || '');
    
    // Autres états
    const [adresse, setAdresse] = useState('');
    const [problemType, setProblemType] = useState<string | null>(null);
    // const [description, setdescription] = useState('');
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [localisation, setLocalisation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fonction utilitaire pour sauvegarder les infos de contact
    const saveReporterInfo = (phone: string, name: string) => {
        localStorage.setItem(REPORTER_PHONE_KEY, phone);
        localStorage.setItem(REPORTER_NAME_KEY, name);
    };

    const getProblemTypeId = (problemName: string): number => {
        switch (problemName) {
            case 'BlackOut': return 1;
            case 'Compteur': return 2;
            case 'Lampe': return 3;
            case 'Prise': return 4;
            case 'Ventillo': return 5;
            case 'Électroménager': return 6;
            case 'Solaire': return 7;
            case 'Clim': return 8;
            case 'Brulure': return 8;
            case 'autre': return 8;
            default: return 0; // Un ID par défaut
        }
    };


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isSubmitting) return;

        // Validation simple
        if (!problemType || !telephone || !adresse) {
            present({
                message: 'Veuillez remplir le type de problème, le téléphone et l\'adresse.',
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        setIsSubmitting(true);

        // Retrait du TOKEN et de l'en-tête Authorization
        const API_URL = 'https://api.depannel.com/api/interventions';

        const urgenceData = {
            problem_type_id: getProblemTypeId(problemType!),
            title: problemType,
            description: 'a', // Description non utilisée
            address: adresse,
            latitude: position?.lat || 0,
            longitude: position?.lng || 0,
            priority_level: 'low',
            client_phone: telephone, // Téléphone du signaleur
            client_first_name: 'b', // Nom du signaleur
            client_last_name: 'c',
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                    // L'en-tête Authorization est supprimé ici
                },
                body: JSON.stringify(urgenceData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Échec de la création de l\'intervention');
            }

            const responseData = await response.json();
            const newInterventionId = responseData.data?.id;

            if (!newInterventionId) {
                 throw new Error("ID de l'intervention non reçu. Impossible de suivre.");
            }

            // SAUVEGARDE : Enregistrer les infos dans localStorage après succès
            saveReporterInfo(telephone, ''); // Nom non utilisé actuellement

            present({
                message: 'Déclaration envoyée avec succès ! Redirection vers le suivi.',
                duration: 2500,
                color: 'success'
            });

            // REDIRECTION : Vers la nouvelle route de suivi
            history.push(`/suivie-urgence/${newInterventionId}/${telephone}`);

        } catch (error: unknown) {
            present({
                message: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi.',
                duration: 4000,
                color: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (buttonStyle reste inchangé) ...
    const buttonStyle = (type: string) => {
        const style: Record<string, string | number | undefined> = {
            borderRadius: '10px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textTransform: 'none',
            boxShadow: problemType === type ? '0 2px 6px rgba(0,0,0,0.15)' : undefined,
        };
        style['--background'] = problemType === type ? '#adcbffff' : '#f4f5f8';
        style['--color'] = problemType === type ? '#000' : '#666';
        return style as React.CSSProperties;
    };

    const handleGetLocation = async () => {
        setIsLocating(true);
        try {
            const currentPosition: Position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
            });

            const lat = currentPosition.coords.latitude;
            const lng = currentPosition.coords.longitude;

            setPosition({ lat, lng });

            const locationString = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            setLocalisation(locationString);
            
            // Mise à jour de l'adresse par défaut si l'utilisateur ne l'a pas encore remplie
            // if (!adresse) setAdresse(locationString);

            present({
                message: 'Localisation GPS récupérée avec succès.',
                duration: 2000,
                color: 'success'
            });

        } catch (error) {
            console.error('Erreur de géolocalisation:', error);
            present({
                message: 'Impossible de récupérer la localisation. Veuillez vérifier les permissions.',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setIsLocating(false);
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
                <IonLoading isOpen={isSubmitting} message={"Envoi de l'alerte..."} />

                <form onSubmit={handleSubmit}>
                    {/* Numéro de Téléphone (Pré-rempli) */}
                    <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
                        <IonLabel position="floating" style={{ marginBottom : '15px' }}>Téléphone *</IonLabel>
                        <IonInput
                            type="tel"
                            value={telephone}
                            onIonChange={e => setTelephone(e.detail.value!)}
                            required
                        ></IonInput>
                    </IonItem>

                    {/* Adresse */}
                    <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
                        <IonLabel position="floating" style={{ marginBottom : '15px' }}>Votre adresse (lieu d'intervention) *</IonLabel>
                        <IonInput
                            type="text"
                            placeholder="Votre adresse"
                            value={adresse}
                            onIonChange={e => setAdresse(e.detail.value!)}
                            required
                        ></IonInput>
                    </IonItem>
                    
                    {/* Localisation GPS */}
                    <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px' }}>Ma Localisation exacte (GPS)</IonLabel>
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
                                style={{ '--padding-start': '0px', '--padding-end': '0px' }}
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

                    {/* Type de Problème */}
                    <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>Type de problème *</IonLabel>
                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle('BlackOut')} onClick={() => setProblemType('BlackOut')} aria-pressed={problemType === 'BlackOut'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>BlackOut</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Panne de courant générale</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle('Compteur')} onClick={() => setProblemType('Compteur')} aria-pressed={problemType === 'Compteur'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Compteur</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Défaut au niveau du compteur</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle('Lampe')} onClick={() => setProblemType('Lampe')} aria-pressed={problemType === 'Lampe'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Lampe</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Défaut éclairage</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle('Prise')} onClick={() => setProblemType('Prise')} aria-pressed={problemType === 'Prise'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Prise</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Défaut au niveau de la prise</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Ventillo")} onClick={() => setProblemType('Ventillo')} aria-pressed={problemType === 'Ventillo'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Ventillo</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Panne de brasseur d'air</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Clim")} onClick={() => setProblemType('Clim')} aria-pressed={problemType === 'Clim'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Clim</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Défaut de climatisation</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Électroménager")} onClick={() => setProblemType('Électroménager')} aria-pressed={problemType === 'Électroménager'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Électroménager</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Appareils électriques et électroniques</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Brulure")} onClick={() => setProblemType('Brulure')} aria-pressed={problemType === 'Brulure'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Brulure</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Flame, étincelle, etc</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Solaire")} onClick={() => setProblemType('Solaire')} aria-pressed={problemType === 'Solaire'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Solaire</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Panneau solaire, batterie, conversatisseur, etc</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("autre")} onClick={() => setProblemType('autre')} aria-pressed={problemType === 'autre'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}>
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Autre</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Autres problèmes élètrique ou électronique</small>
                                    </div>
                                </IonButton>
                            </IonCol>
                            {/* <IonCol size="6">
                                <IonButton type="button" expand="block" style={buttonStyle("Autres")} onClick={() => setProblemType('Autres')} aria-pressed={problemType === 'Autres'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px' }}> */}
                                        {/* <Power style={{ fontSize: '1.8em' }} /> */}
                                        {/* <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Autre</IonLabel>
                                        <small style={{ fontSize: '0.7em', opacity: 0.8, textTransform: 'none', lineHeight: '1' }}>Autres problèmes élètrique ou électronique</small>
                                    </div>
                                </IonButton>
                            </IonCol> */}
                        </IonRow>
                    </IonGrid>

                    {/* Description
                    <IonItem lines="full" style={{ '--background': '#fff', borderRadius: '10px', marginBottom: '15px' }}>
                        <IonLabel position="floating" style={{ marginBottom : '15px' }}>Description (optionnel)</IonLabel>
                        <IonTextarea
                            placeholder="Décrivez le problème"
                            autoGrow={true}
                            value={description}
                            onIonChange={e => setdescription(e.detail.value!)}
                        ></IonTextarea>
                    </IonItem> */}

                    <IonButton
                        type="submit"
                        expand="block"
                        size="large"
                        className="ion-margin-top"
                        disabled={isSubmitting}
                        style={{ '--background': '#ffc409', '--color': '#000', '--border-radius': '10px', height: '50px', textTransform: 'none', fontSize: '1.2em', fontWeight: 'bold' }}
                    >
                        {isSubmitting ? "Envoi en cours..." : "Envoyer la déclaration"}
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export default SignalerUrgence;