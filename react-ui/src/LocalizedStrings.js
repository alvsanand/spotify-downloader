import LocalizedStrings from 'react-localization';

var userLang = navigator.language || navigator.userLanguage; 

// Fix for bug https://github.com/stefalda/react-localization/issues/76
class MyLocalizedStrings extends LocalizedStrings {
    constructor(props) {
        let language = userLang;
        if(!(language in props)){
            language = Object.keys(props)[0];
        }
        
        super({language: props[language]});
    }
}

export default MyLocalizedStrings;