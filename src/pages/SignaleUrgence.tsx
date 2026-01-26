import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonItem,
    IonLabel, IonInput, IonButton, useIonToast, IonLoading
} from '@ionic/react';
import { MapPin } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import { Geolocation, Position } from '@capacitor/geolocation';

import { 
    IonModal, IonList, IonRadioGroup, IonRadio, IonIcon 
} from '@ionic/react';
import { 
    chevronForwardOutline, alertCircleOutline,
} from 'ionicons/icons';

// Interface pour le futur appel API
interface ProblemType {
    id: number;
    name: string;
    description: string;
    icon?: string;
}

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
    const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
    const [selectedProblemType, setSelectedProblemType] = useState('');
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    // const [description, setdescription] = useState('');
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [localisation, setLocalisation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {

        const fetchProblemTypes = async () => {
            try {
                const response = await fetch('https://api.depannel.com/api/problem-types?active_only=true', {
                    headers: { 'Accept': 'application/json' }
                });
                const result = await response.json();
                // On récupère le tableau dans result.data comme montré dans votre capture Swagger
                setProblemTypes(result.data || []);
            } catch (error) {
                console.error("Erreur lors du chargement des types:", error);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchProblemTypes();
    }, []);

    // Fonction utilitaire pour sauvegarder les infos de contact
    const saveReporterInfo = (phone: string, name: string) => {
        localStorage.setItem(REPORTER_PHONE_KEY, phone);
        localStorage.setItem(REPORTER_NAME_KEY, name);
    };

    const [showTypeModal, setShowTypeModal] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isSubmitting) return;

        // Validation simple
        if (!selectedProblemType || !telephone || !adresse) {
            present({
                message: 'Veuillez remplir le type de problème, le téléphone et l\'adresse.',
                duration: 2000,
                color: 'danger'
            });
            return;
        }

        setIsSubmitting(true);

        const typeId = problemTypes.find(t => t.name === selectedProblemType)?.id;

        if (!typeId) {
            present({ message: "Type de problème invalide", color: 'danger' });
            return;
        }

        // Retrait du TOKEN et de l'en-tête Authorization
        const API_URL = 'https://api.depannel.com/api/interventions';

        const urgenceData = {
            problem_type_id: typeId,
            title: selectedProblemType,
            description: "a", // Description non utilisée
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
                    {/* Sélecteur de Type de Problème Moderne */}
                    <IonLabel style={{ display: 'block', marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>
                        Type de problème *
                    </IonLabel>

                    <div
                        onClick={() => setShowTypeModal(true)}
                        style={{
                            background: '#fff',
                            padding: '15px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: selectedProblemType ? '2px solid #3880ff' : '1px solid #ddd',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                background: selectedProblemType ? '#3880ff' : '#f4f5f8', 
                                padding: '10px', 
                                borderRadius: '10px',
                                marginRight: '15px',
                                color: selectedProblemType ? '#fff' : '#666'
                            }}>
                                <IonIcon icon={problemTypes.find(p => p.name === selectedProblemType)?.icon || alertCircleOutline} size="large" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#000' }}>
                                    {selectedProblemType || "Choisir le type de panne"}
                                </div>
                                <small style={{ color: '#666' }}>
                                    {problemTypes.find(p => p.name === selectedProblemType)?.description || "Cliquez pour sélectionner"}
                                </small>
                            </div>
                        </div>
                        <IonIcon icon={chevronForwardOutline} color="medium" />
                    </div>
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
                {/* Modal de sélection du type de problème */}
                <IonModal
                    isOpen={showTypeModal}
                    onDidDismiss={() => setShowTypeModal(false)}
                    breakpoints={[0, 0.5, 0.8]}
                    initialBreakpoint={0.8}
                >
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Type de problème</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowTypeModal(false)}>Fermer</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <IonList lines="full">
                            {isLoadingTypes ? (
                                <div className="ion-text-center ion-padding">Chargement des pannes...</div>
                            ) : (
                                <IonRadioGroup value={selectedProblemType} onIonChange={e => {
                                    setSelectedProblemType(e.detail.value);
                                    setShowTypeModal(false);
                                }}>
                                    {problemTypes.map((type) => (
                                        <IonItem key={type.id}>
                                            <IonLabel>
                                                <h2>{type.name}</h2>
                                                <p>{type.description}</p>
                                            </IonLabel>
                                            <IonRadio slot="end" value={type.name} />
                                        </IonItem>
                                    ))}
                                </IonRadioGroup>
                            )}
                        </IonList>
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default SignalerUrgence;