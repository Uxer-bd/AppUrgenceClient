import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Accueil from './pages/Accueil';
import SignaleUrgence from './pages/SignaleUrgence';
import SuivieUrgence from './pages/SuivieUrgence';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/accueil">
            <Accueil/>
          </Route>
          <Route exact path="/signale-urgence">
            <SignaleUrgence />
          </Route>
          <Route exact path="/suivie-urgence">
            <SuivieUrgence />
          </Route>
          <Route exact path="/">
            <Redirect to="/accueil" />
          </Route>
        </IonRouterOutlet>
        {/* <IonTabBar slot="bottom">
          <IonTabButton tab="Accueil" href="/accueil">
            <IonIcon aria-hidden="true" icon={triangle} />
            <IonLabel>Accueil</IonLabel>
          </IonTabButton>
          <IonTabButton tab="SignaleUrgence" href="/signale-urgence">
            <IonIcon aria-hidden="true" icon={ellipse} />
            <IonLabel>Signal</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Tab 3</IonLabel>
          </IonTabButton>
        </IonTabBar> */}
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
