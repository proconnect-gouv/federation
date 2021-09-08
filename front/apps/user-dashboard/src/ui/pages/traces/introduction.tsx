import classnames from 'classnames';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  introduction: {
    backgroundColor: '#FFFFFF', // accessibility purpose
  },
});

const IntroductionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classnames(classes.introduction)}>
      <h4 className="is-blue-france mb8">
        <b>Votre historique de connexion</b>
      </h4>
      <p className="is-normal fr-text">
        Retrouver toutes les connexions et échanges de données effectués via
        FranceConnect ces six derniers mois. Cliquez sur une connexion pour en
        afficher les détails.
      </p>
    </div>
  );
};

IntroductionComponent.displayName = 'IntroductionComponent';

export default IntroductionComponent;
