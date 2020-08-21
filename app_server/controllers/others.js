/* GET about */
const about = (req, res) => {
    res.render('generic-text', {
        title: 'About Loc8r',
        content: 'Loc8r was created to help people find places to sit down to work and drink coffee.<br/><br/>Quis pariatur laborum aute excepteur eu pariatur aute. Sint in ipsum cillum consectetur fugiat mollit irure culpa magna cupidatat cillum. Ex adipisicing anim qui laboris sit. Ad consectetur adipisicing esse excepteur sint consectetur ad aliqua cupidatat do.'
      });
  };

  module.exports = {
    about
  };