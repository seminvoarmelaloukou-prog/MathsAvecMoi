/* Campus Flex – couleur et langue (un seul fichier)
   - Couleur : palettes prêtes + couleur libre, mémorisées sur l'appareil, appliquées à toutes les pages.
   - Langue : français, anglais, espagnol. Seule l'interface est traduite (menus, boutons, messages).
     Les cours et les textes écrits par les enseignants restent dans leur langue d'origine.
   Pour ajouter une traduction : voir la section DICTIONNAIRE tout en bas. Un texte sans traduction reste en français. */
(function () {
  "use strict";

  /* ================================================================== */
  /* DICTIONNAIRE – chaque ligne : [français, anglais, espagnol]         */
  /* ================================================================== */
  var LIGNES = [["Accueil", "Home", "Inicio"], ["Contact", "Contact", "Contacto"], ["Emploi du temps", "Timetable", "Horario"], ["Matières", "Subjects", "Asignaturas"], ["Mon bulletin", "My report card", "Mi boletín"], ["Mon profil", "My profile", "Mi perfil"], ["Navigation principale", "Main navigation", "Navegación principal"], ["© 2026 Campus Flex - Tous droits réservés -", "© 2026 Campus Flex - All rights reserved -", "© 2026 Campus Flex - Todos los derechos reservados -"], ["© 2026 Campus Flex - Tous droits réservés", "© 2026 Campus Flex - All rights reserved", "© 2026 Campus Flex - Todos los derechos reservados"], ["Échanges", "Discussions", "Debates"], ["Composer", "Sit a test", "Hacer un examen"], ["Mes résultats", "My results", "Mis resultados"], ["Ouvrir le menu", "Open the menu", "Abrir el menú"], ["Fermer le menu", "Close the menu", "Cerrar el menú"], ["Se déconnecter", "Log out", "Cerrar sesión"], ["Déconnexion", "Log out", "Cerrar sesión"], ["À bientôt", "See you soon", "Hasta pronto"], ["Chargement...", "Loading...", "Cargando..."], ["Chargement…", "Loading…", "Cargando…"], ["Créer un compte", "Create an account", "Crear una cuenta"], ["Se connecter", "Log in", "Iniciar sesión"], ["Adresse e-mail", "Email address", "Correo electrónico"], ["Afficher", "Show", "Mostrar"], ["Masquer", "Hide", "Ocultar"], ["Afficher le mot de passe", "Show password", "Mostrar contraseña"], ["Masquer le mot de passe", "Hide password", "Ocultar contraseña"], ["Afficher la confirmation du mot de passe", "Show password confirmation", "Mostrar la confirmación de la contraseña"], ["Allemand", "German", "Alemán"], ["Anglais", "English", "Inglés"], ["Devoirs", "Homework", "Tareas"], ["EPS", "Physical education", "Educación física"], ["Envoyer", "Send", "Enviar"], ["Espagnol", "Spanish", "Español"], ["Français", "French", "Francés"], ["Histoire-Géographie", "History & Geography", "Historia y Geografía"], ["Mathématiques", "Mathematics", "Matemáticas"], ["Maths", "Maths", "Mates"], ["Mot de passe", "Password", "Contraseña"], ["Philosophie", "Philosophy", "Filosofía"], ["SVT", "Life sciences", "Ciencias naturales"], ["S’inscrire", "Sign up", "Registrarse"], ["Type de français", "Type of French", "Tipo de francés"], ["Évaluation blanche", "Practice test", "Examen de práctica"], ["Évaluations", "Tests", "Evaluaciones"], ["← Retour à l’accueil", "← Back to home", "← Volver al inicio"], [", tous les champs restent modifiables.", ", all fields remain editable.", ", todos los campos siguen siendo editables."], ["Ajoute une photo nette et bien à plat de ta carte d'identité (ou son PDF). Nous lisons automatiquement ton nom", "Add a clear, flat photo of your ID card (or its PDF). We automatically read your last name", "Añade una foto nítida y plana de tu documento de identidad (o su PDF). Leemos automáticamente tu apellido"], ["Aperçu de la carte d'identité", "ID card preview", "Vista previa del documento de identidad"], ["Appuie sur le dessin pour le revoir", "Tap the drawing to watch it again", "Toca el dibujo para verlo de nuevo"], ["Au moins 6 caractères", "At least 6 characters", "Al menos 6 caracteres"], ["Bienvenue !", "Welcome!", "¡Bienvenido!"], ["Blanches", "Practice", "Práctica"], ["Bloqué sur un exercice ? Demande à Nora.", "Stuck on an exercise? Ask Nora.", "¿Atascado en un ejercicio? Pregunta a Nora."], ["Bonjour ! Je suis Nora, ton tuteur. Pose-moi tes questions en maths, en français, en anglais, en SVT, en PCT et dans tes autres matières !", "Hello! I'm Nora, your tutor. Ask me your questions in maths, French, English, life sciences, PCT and your other subjects!", "¡Hola! Soy Nora, tu tutora. ¡Hazme tus preguntas de matemáticas, francés, inglés, ciencias, PCT y tus otras asignaturas!"], ["Campus Flex – Ton école en ligne, flexible et accessible", "Campus Flex – Your online school, flexible and accessible", "Campus Flex – Tu escuela en línea, flexible y accesible"], ["Carte d'identité (photo ou PDF)", "ID card (photo or PDF)", "Documento de identidad (foto o PDF)"], ["Ce que tu trouves sur Campus Flex", "What you will find on Campus Flex", "Lo que encontrarás en Campus Flex"], ["Chargement de ta classe…", "Loading your class…", "Cargando tu clase…"], ["Chargement de tes bulletins...", "Loading your report cards...", "Cargando tus boletines..."], ["Chargement de ton profil", "Loading your profile", "Cargando tu perfil"], ["Choisir la matière", "Choose the subject", "Elige la asignatura"], ["Choisir une autre épreuve", "Choose another test", "Elegir otra prueba"], ["Choisis ta classe", "Choose your class", "Elige tu clase"], ["Choisis ton pays", "Choose your country", "Elige tu país"], ["Choisis un identifiant d’au moins 3 caractères.", "Choose a username of at least 3 characters.", "Elige un nombre de usuario de al menos 3 caracteres."], ["Choisis une matière pour accéder aux cours, exercices et évaluations.", "Choose a subject to access lessons, exercises and tests.", "Elige una asignatura para acceder a las clases, ejercicios y evaluaciones."], ["Choisis une matière pour voir un exemple", "Choose a subject to see an example", "Elige una asignatura para ver un ejemplo"], ["Classe", "Class", "Clase"], ["Code reçu par SMS", "Code received by SMS", "Código recibido por SMS"], ["Commencer", "Start", "Empezar"], ["Composer - Campus Flex", "Sit a test - Campus Flex", "Hacer un examen - Campus Flex"], ["Composer une évaluation", "Sit a test", "Hacer una evaluación"], ["Confirmer le mot de passe", "Confirm password", "Confirmar contraseña"], ["Connecte-toi pour accéder à la plateforme.", "Log in to access the platform.", "Inicia sesión para acceder a la plataforma."], ["Connexion", "Log in", "Iniciar sesión"], ["Connexion - Campus Flex", "Log in - Campus Flex", "Iniciar sesión - Campus Flex"], ["Content de te revoir !", "Good to see you again!", "¡Qué bueno verte de nuevo!"], ["Continuer", "Continue", "Continuar"], ["Cours", "Lessons", "Clases"], ["Cours structurés", "Structured lessons", "Clases estructuradas"], ["Crée ton compte et choisis ta classe.", "Create your account and choose your class.", "Crea tu cuenta y elige tu clase."], ["Crée ton espace apprenant. Ton numéro WhatsApp doit être vérifié par SMS.", "Create your learner space. Your WhatsApp number must be verified by SMS.", "Crea tu espacio de estudiante. Tu número de WhatsApp debe verificarse por SMS."], ["Dans quelle matière ?", "In which subject?", "¿En qué asignatura?"], ["Date de naissance", "Date of birth", "Fecha de nacimiento"], ["Des cours clairs, des exercices progressifs et des évaluations, de la 6e à la Terminale. Tout est sur ton téléphone, quand tu veux.", "Clear lessons, progressive exercises and tests, from year 6e to Terminale. Everything on your phone, whenever you want.", "Clases claras, ejercicios progresivos y evaluaciones, de 6e a Terminale. Todo en tu teléfono, cuando quieras."], ["Des leçons claires, conformes au programme, de la 6e à la Terminale.", "Clear lessons that follow the curriculum, from 6e to Terminale.", "Lecciones claras, conformes al programa, de 6e a Terminale."], ["Devoirs - Campus Flex", "Homework - Campus Flex", "Tareas - Campus Flex"], ["Discussion de classe", "Class discussion", "Debate de clase"], ["Du collège au lycée : choisis ta classe pour accéder aux cours, exercices et évaluations.", "From middle school to high school: choose your class to access lessons, exercises and tests.", "De la secundaria al bachillerato: elige tu clase para acceder a las clases, ejercicios y evaluaciones."], ["Emploi du temps - Campus Flex", "Timetable - Campus Flex", "Horario - Campus Flex"], ["Emploi du temps de ma classe", "My class timetable", "Horario de mi clase"], ["Entraîne-toi ou compose, puis retrouve tes notes par matière.", "Practise or sit a test, then find your marks by subject.", "Practica o haz un examen, y encuentra tus notas por asignatura."], ["Entre le code reçu sur ton téléphone pour confirmer ton numéro.", "Enter the code received on your phone to confirm your number.", "Introduce el código recibido en tu teléfono para confirmar tu número."], ["Envoyer la photo d'un exercice", "Send a photo of an exercise", "Enviar la foto de un ejercicio"], ["Envoyer le code SMS", "Send the SMS code", "Enviar el código SMS"], ["Envoyer mes réponses", "Submit my answers", "Enviar mis respuestas"], ["Exemple : 0700000000", "Example: 0700000000", "Ejemplo: 0700000000"], ["Exemple : 123456", "Example: 123456", "Ejemplo: 123456"], ["Exemple : Aloukou", "Example: Aloukou", "Ejemplo: Aloukou"], ["Exemple : Armel", "Example: Armel", "Ejemplo: Armel"], ["Exemple : armel2026", "Example: armel2026", "Ejemplo: armel2026"], ["Exemple : vous@email.com", "Example: you@email.com", "Ejemplo: tu@email.com"], ["Exercices progressifs", "Progressive exercises", "Ejercicios progresivos"], ["Filtrer les résultats", "Filter results", "Filtrar resultados"], ["Gagner du temps avec ma carte d’identité (facultatif)", "Save time with my ID card (optional)", "Ahorrar tiempo con mi documento de identidad (opcional)"], ["Identifiant", "Username", "Nombre de usuario"], ["Initiateur du projet Campus Flex", "Founder of the Campus Flex project", "Fundador del proyecto Campus Flex"], ["Inscription - Campus Flex", "Sign up - Campus Flex", "Registro - Campus Flex"], ["Joindre la photo d'un exercice", "Attach a photo of an exercise", "Adjuntar la foto de un ejercicio"], ["Lecture de la carte en cours...", "Reading the card...", "Leyendo el documento..."], ["Lecture", "Reading", "Lectura"], ["L’équipe", "The team", "El equipo"], ["Ma classe", "My class", "Mi clase"], ["Matière", "Subject", "Asignatura"], ["Mathématiques - Campus Flex", "Mathematics - Campus Flex", "Matemáticas - Campus Flex"], ["Matières - Campus Flex", "Subjects - Campus Flex", "Asignaturas - Campus Flex"], ["Matières disponibles", "Available subjects", "Asignaturas disponibles"], ["Mes résultats - Campus Flex", "My results - Campus Flex", "Mis resultados - Campus Flex"], ["Mets-toi au défi avec des exercices adaptés à ton niveau.", "Challenge yourself with exercises suited to your level.", "Ponte a prueba con ejercicios adaptados a tu nivel."], ["Mon bulletin - Campus Flex", "My report card - Campus Flex", "Mi boletín - Campus Flex"], ["Mon emploi du temps", "My timetable", "Mi horario"], ["Mon emploi du temps en document", "My timetable as a document", "Mi horario en documento"], ["Mon profil - Campus Flex", "My profile - Campus Flex", "Mi perfil - Campus Flex"], ["Mot de passe oublié ?", "Forgot your password?", "¿Olvidaste tu contraseña?"], ["Nom", "Last name", "Apellido"], ["Nora :", "Nora:", "Nora:"], ["Nora est ton tuteur. Elle t’explique la méthode pas à pas, sans te donner juste la réponse.", "Nora is your tutor. She explains the method step by step, without just giving you the answer.", "Nora es tu tutora. Te explica el método paso a paso, sin darte solo la respuesta."], ["Nous contacter", "Contact us", "Contáctanos"], ["Numéro WhatsApp", "WhatsApp number", "Número de WhatsApp"], ["Officielles", "Official", "Oficiales"], ["Oui, envoyer", "Yes, send", "Sí, enviar"], ["Ouvre tes cours et lance-toi.", "Open your lessons and get started.", "Abre tus clases y empieza."], ["Où veux-tu aller ?", "Where do you want to go?", "¿A dónde quieres ir?"], ["Pas de connexion - Campus Flex", "No connection - Campus Flex", "Sin conexión - Campus Flex"], ["Pays", "Country", "País"], ["Photo de l'exercice", "Photo of the exercise", "Foto del ejercicio"], ["Photo prête à envoyer", "Photo ready to send", "Foto lista para enviar"], ["Pose ta question ou joins un exercice 📷", "Ask your question or attach an exercise 📷", "Haz tu pregunta o adjunta un ejercicio 📷"], ["Pose tes questions dans toutes tes matières !", "Ask your questions in all your subjects!", "¡Haz tus preguntas en todas tus asignaturas!"], ["Pose tes questions à tes enseignants et échange avec ta classe. Reste poli et respectueux : les enseignants peuvent supprimer un message.", "Ask your teachers questions and chat with your class. Stay polite and respectful: teachers can delete a message.", "Haz preguntas a tus profesores y conversa con tu clase. Sé amable y respetuoso: los profesores pueden eliminar un mensaje."], ["Pour chaque élève", "For every student", "Para cada estudiante"], ["Pour commencer", "Getting started", "Para empezar"], ["Pour t'entraîner : tu peux recommencer", "To practise: you can try again", "Para practicar: puedes repetir"], ["Prénom", "First name", "Nombre"], ["Préremplie automatiquement si tu ajoutes ta carte d'identité ci-dessus.", "Filled in automatically if you add your ID card above.", "Se rellena automáticamente si añades tu documento de identidad arriba."], ["Publier", "Post", "Publicar"], ["Que tu sois en difficulté, en rattrapage ou candidat libre, Campus Flex t’accompagne à ton rythme, où que tu sois.", "Whether you are struggling, catching up or an independent candidate, Campus Flex supports you at your own pace, wherever you are.", "Ya sea que tengas dificultades, estés recuperando o seas candidato libre, Campus Flex te acompaña a tu ritmo, estés donde estés."], ["Que veux-tu faire ?", "What do you want to do?", "¿Qué quieres hacer?"], ["Reprendre", "Resume", "Continuar"], ["Retour aux cours", "Back to lessons", "Volver a las clases"], ["Retour à la liste", "Back to the list", "Volver a la lista"], ["Retour à la liste des épreuves", "Back to the list of tests", "Volver a la lista de pruebas"], ["Retour à mon profil", "Back to my profile", "Volver a mi perfil"], ["Retrouve ici tes évaluations blanches et officielles.", "Find your practice and official tests here.", "Encuentra aquí tus evaluaciones de práctica y oficiales."], ["Récupération de tes informations...", "Retrieving your information...", "Recuperando tu información..."], ["Réessayer", "Try again", "Reintentar"], ["Réponses envoyées", "Answers submitted", "Respuestas enviadas"], ["Réécris ton mot de passe", "Retype your password", "Escribe de nuevo tu contraseña"], ["Seuls toi et les enseignants de cette matière pour ta classe pouvez lire ces messages.", "Only you and the teachers of this subject for your class can read these messages.", "Solo tú y los profesores de esta asignatura de tu clase pueden leer estos mensajes."], ["Ta semaine", "Your week", "Tu semana"], ["Tes cours et tes exercices ont besoin d’internet. Vérifie ton réseau ou tes données mobiles, puis réessaie.", "Your lessons and exercises need the internet. Check your network or mobile data, then try again.", "Tus clases y ejercicios necesitan internet. Revisa tu red o tus datos móviles y vuelve a intentarlo."], ["Tes matières", "Your subjects", "Tus asignaturas"], ["Tes notes", "Your marks", "Tus notas"], ["Tes questions", "Your questions", "Tus preguntas"], ["Toi", "You", "Tú"], ["Ton compte", "Your account", "Tu cuenta"], ["Ton mot de passe", "Your password", "Tu contraseña"], ["Ton numéro WhatsApp", "Your WhatsApp number", "Tu número de WhatsApp"], ["Ton école en ligne, flexible et accessible", "Your online school, flexible and accessible", "Tu escuela en línea, flexible y accesible"], ["Tous", "All", "Todos"], ["Tous tes résultats d’évaluations, rangés par matière.", "All your test results, sorted by subject.", "Todos tus resultados de evaluaciones, ordenados por asignatura."], ["Tout le monde dans ta classe peut lire cette discussion.", "Everyone in your class can read this discussion.", "Todos en tu clase pueden leer este debate."], ["Tu as déjà un compte ?", "Already have an account?", "¿Ya tienes una cuenta?"], ["Tu n’as pas de connexion pour le moment.", "You have no connection right now.", "No tienes conexión por el momento."], ["Tu n’as pas encore de compte ?", "Don't have an account yet?", "¿Aún no tienes cuenta?"], ["Tu étais sur", "You were on", "Estabas en"], ["Télécharger en PDF", "Download as PDF", "Descargar en PDF"], ["Un code a été envoyé par SMS.", "A code has been sent by SMS.", "Se ha enviado un código por SMS."], ["Une question ?", "A question?", "¿Una pregunta?"], ["Une seule tentative", "One attempt only", "Un solo intento"], ["Voici les informations associées à ton compte.", "Here is the information linked to your account.", "Aquí está la información asociada a tu cuenta."], ["Voir l'aperçu", "View preview", "Ver vista previa"], ["Voir le texte détecté", "Show detected text", "Ver el texto detectado"], ["Voir mes résultats", "View my results", "Ver mis resultados"], ["Vérification du numéro", "Number verification", "Verificación del número"], ["Vérifier le code et créer mon compte", "Verify the code and create my account", "Verificar el código y crear mi cuenta"], ["exemple@email.com", "example@email.com", "ejemplo@email.com"], ["nouveau", "new", "nuevo"], ["vérifie et corrige si besoin", "check and correct if needed", "comprueba y corrige si es necesario"], ["Écrire à mon enseignant", "Write to my teacher", "Escribir a mi profesor"], ["Écris ton message à l'enseignant de cette matière...", "Write your message to the teacher of this subject...", "Escribe tu mensaje al profesor de esta asignatura..."], ["Écris ton numéro local complet, avec ou sans le premier zéro. Exemple : 0700000000 pour la Côte d’Ivoire.", "Write your full local number, with or without the leading zero. Example: 0700000000 for Ivory Coast.", "Escribe tu número local completo, con o sin el primer cero. Ejemplo: 0700000000 para Costa de Marfil."], ["Écris un message pour ta classe...", "Write a message for your class...", "Escribe un mensaje para tu clase..."], ["Écris-nous, nous te répondons dès que possible.", "Write to us, we will reply as soon as possible.", "Escríbenos, te responderemos lo antes posible."], ["Évaluation", "Test", "Evaluación"], ["Évaluation officielle", "Official test", "Evaluación oficial"], ["Évaluations et suivi", "Tests and progress", "Evaluaciones y seguimiento"], ["Évalue-toi et suis tes progrès grâce à un tableau de bord personnel.", "Test yourself and follow your progress with a personal dashboard.", "Evalúate y sigue tu progreso con un panel personal."], ["← Changer de matière", "← Change subject", "← Cambiar de asignatura"], ["← on isole x, pas à pas", "← we isolate x, step by step", "← aislamos x, paso a paso"], ["✍️ Mode Écrit", "✍️ Writing mode", "✍️ Modo escrito"], ["✕ Retirer", "✕ Remove", "✕ Quitar"], ["🎤 Appuie pour parler", "🎤 Tap to speak", "🎤 Toca para hablar"], ["🎤 Mode Vocal", "🎤 Voice mode", "🎤 Modo de voz"], ["🤖 Tuteur Nora - Ton assistant IA", "🤖 Tutor Nora - Your AI assistant", "🤖 Tutora Nora - Tu asistente de IA"], ["Résous : 2x + 3 = 11", "Solve: 2x + 3 = 11", "Resuelve: 2x + 3 = 11"], ["Salut !", "Hi!", "¡Hola!"], ["Mon espace", "My space", "Mi espacio"], ["Tu n’as encore passé aucune évaluation.", "You haven't taken any test yet.", "Aún no has hecho ninguna evaluación."], ["Aucun résultat de ce type pour le moment.", "No results of this type yet.", "Aún no hay resultados de este tipo."], ["Aucun devoir de ce type pour le moment.", "No homework of this type yet.", "Aún no hay tareas de este tipo."], ["Aucune épreuve de ce type pour le moment.", "No tests of this type yet.", "Aún no hay pruebas de este tipo."], ["Aucune évaluation n'est ouverte pour le moment. Reviens plus tard : ton enseignant l'activera.", "No test is open right now. Come back later: your teacher will activate it.", "No hay ninguna evaluación abierta por ahora. Vuelve más tarde: tu profesor la activará."], ["Bravo, continue comme ça !", "Well done, keep it up!", "¡Bravo, sigue así!"], ["C'est un entraînement : tu pourras recommencer autant de fois que tu veux.", "This is practice: you can start again as many times as you like.", "Es una práctica: puedes repetir tantas veces como quieras."], ["Ce compte n'est pas un compte élève. Va dans Mon profil.", "This is not a student account. Go to My profile.", "Esta no es una cuenta de estudiante. Ve a Mi perfil."], ["Cette adresse e-mail est déjà utilisée.", "This email address is already in use.", "Este correo electrónico ya está en uso."], ["Ce numéro est déjà associé à un autre compte.", "This number is already linked to another account.", "Este número ya está asociado a otra cuenta."], ["Cette épreuve ne contient pas de question active pour le moment.", "This test has no active questions right now.", "Esta prueba no tiene preguntas activas por ahora."], ["Choisis l'épreuve à passer.", "Choose the test to take.", "Elige la prueba que quieres hacer."], ["Choisis ta classe.", "Choose your class.", "Elige tu clase."], ["Choisis ton pays.", "Choose your country.", "Elige tu país."], ["Code SMS envoyé", "SMS code sent", "Código SMS enviado"], ["Code envoyé. Vérifie tes SMS.", "Code sent. Check your SMS.", "Código enviado. Revisa tus SMS."], ["Communication écrite", "Written communication", "Comunicación escrita"], ["Corrigé disponible", "Answer key available", "Solucionario disponible"], ["Corrigé pas encore disponible", "Answer key not yet available", "Solucionario aún no disponible"], ["Cours bientôt disponible", "Lessons coming soon", "Clases próximamente"], ["Demande d’abord un code SMS.", "First request an SMS code.", "Primero solicita un código SMS."], ["Déjà composée", "Already taken", "Ya realizada"], ["Envoi du code SMS...", "Sending the SMS code...", "Enviando el código SMS..."], ["Envoi en cours...", "Sending...", "Enviando..."], ["Erreur de chargement. Réessaie dans un instant.", "Loading error. Try again in a moment.", "Error de carga. Inténtalo de nuevo en un momento."], ["Erreur de chargement. Vérifie ta connexion et réessaie.", "Loading error. Check your connection and try again.", "Error de carga. Comprueba tu conexión e inténtalo de nuevo."], ["Erreur micro.", "Microphone error.", "Error de micrófono."], ["Impossible de charger les devoirs pour le moment.", "Unable to load homework right now.", "No se pueden cargar las tareas por ahora."], ["Impossible de charger ton profil.", "Unable to load your profile.", "No se puede cargar tu perfil."], ["Impossible de lire cette photo. Essaie-en une autre.", "Unable to read this photo. Try another one.", "No se puede leer esta foto. Prueba con otra."], ["Impossible de vérifier ta tentative. Vérifie ta connexion et réessaie.", "Unable to check your attempt. Check your connection and try again.", "No se puede comprobar tu intento. Comprueba tu conexión e inténtalo de nuevo."], ["Indique ton numéro WhatsApp.", "Enter your WhatsApp number.", "Indica tu número de WhatsApp."], ["Indique un nom valide.", "Enter a valid last name.", "Indica un apellido válido."], ["Indique un prénom valide.", "Enter a valid first name.", "Indica un nombre válido."], ["Indique une adresse e-mail.", "Enter an email address.", "Indica un correo electrónico."], ["Je mets trop de temps à répondre. Renvoie ta question dans un instant !", "I'm taking too long to answer. Send your question again in a moment!", "¡Tardo demasiado en responder! Vuelve a enviar tu pregunta en un momento."], ["Je n'arrive pas à joindre le serveur. Vérifie ta connexion puis réessaie !", "I can't reach the server. Check your connection then try again!", "No consigo conectar con el servidor. ¡Comprueba tu conexión e inténtalo de nuevo!"], ["Je n'arrive pas à répondre pour le moment. Réessaie dans un instant !", "I can't answer right now. Try again in a moment!", "No puedo responder por ahora. ¡Inténtalo de nuevo en un momento!"], ["L'envoi a échoué. Vérifie ta connexion, puis appuie sur « Réessayer l'envoi » : tes réponses sont conservées.", "Sending failed. Check your connection, then tap “Retry sending”: your answers are saved.", "El envío falló. Comprueba tu conexión y pulsa «Reintentar el envío»: tus respuestas se conservan."], ["La lecture automatique a échoué. Remplis les champs manuellement.", "Automatic reading failed. Fill in the fields manually.", "La lectura automática falló. Rellena los campos manualmente."], ["La vérification reCAPTCHA a échoué. Recharge la page puis réessaie.", "The reCAPTCHA check failed. Reload the page then try again.", "La verificación reCAPTCHA falló. Recarga la página e inténtalo de nuevo."], ["Le code SMS a expiré. Demande un nouveau code.", "The SMS code has expired. Request a new code.", "El código SMS ha caducado. Solicita un código nuevo."], ["Le code SMS est incorrect.", "The SMS code is incorrect.", "El código SMS es incorrecto."], ["Le mot de passe doit contenir au moins 6 caractères.", "The password must contain at least 6 characters.", "La contraseña debe tener al menos 6 caracteres."], ["Le temps est écoulé : le sujet n'est plus affiché.", "Time is up: the paper is no longer displayed.", "Se acabó el tiempo: el enunciado ya no se muestra."], ["Les deux mots de passe ne sont pas identiques.", "The two passwords do not match.", "Las dos contraseñas no coinciden."], ["Les devoirs ne sont pas disponibles pour le moment.", "Homework is not available right now.", "Las tareas no están disponibles por ahora."], ["L’identifiant doit contenir au moins 3 caractères.", "The username must contain at least 3 characters.", "El nombre de usuario debe tener al menos 3 caracteres."], ["Masquer le bulletin", "Hide report card", "Ocultar boletín"], ["Masquer le texte détecté", "Hide detected text", "Ocultar el texto detectado"], ["Matière non précisée.", "Subject not specified.", "Asignatura no especificada."], ["Meilleure série", "Best streak", "Mejor racha"], ["Nora est très demandée, elle réessaie...", "Nora is very busy, she is trying again...", "Nora está muy solicitada, lo está intentando de nuevo..."], ["Nora regarde ta photo...", "Nora is looking at your photo...", "Nora está mirando tu foto..."], ["Nora réfléchit...", "Nora is thinking...", "Nora está pensando..."], ["Numéro vérifié et compte créé. Redirection vers ton profil...", "Number verified and account created. Redirecting to your profile...", "Número verificado y cuenta creada. Redirigiendo a tu perfil..."], ["Photo envoyée", "Photo sent", "Foto enviada"], ["Problème de connexion Internet. Vérifie le réseau puis réessaie.", "Internet connection problem. Check the network then try again.", "Problema de conexión a Internet. Comprueba la red e inténtalo de nuevo."], ["Préparation de la photo...", "Preparing the photo...", "Preparando la foto..."], ["Préparation en cours", "Being prepared", "En preparación"], ["Question", "Question", "Pregunta"], ["Relis ton cours et recommence : c'est comme ça qu'on progresse.", "Reread your lesson and try again: that is how you improve.", "Repasa tu clase y vuelve a intentarlo: así se progresa."], ["Réessayer l'envoi", "Retry sending", "Reintentar el envío"], ["Réponds à au moins une question avant d'envoyer.", "Answer at least one question before sending.", "Responde al menos una pregunta antes de enviar."], ["Saisis les 6 chiffres du code SMS.", "Enter the 6 digits of the SMS code.", "Introduce los 6 dígitos del código SMS."], ["Service non disponible pour le moment.", "Service unavailable right now.", "Servicio no disponible por ahora."], ["Sujet à consulter", "Paper to view", "Enunciado para consultar"], ["Série actuelle", "Current streak", "Racha actual"], ["Ta classe n'est pas encore renseignée dans ton profil.", "Your class is not set in your profile yet.", "Tu clase aún no está indicada en tu perfil."], ["Ta classe n'est pas renseignée dans ton profil.", "Your class is not set in your profile.", "Tu clase no está indicada en tu perfil."], ["Ta classe n'est pas renseignée.", "Your class is not set.", "Tu clase no está indicada."], ["Temps écoulé", "Time is up", "Tiempo agotado"], ["Temps écoulé : envoi automatique de tes réponses...", "Time is up: your answers are being sent automatically...", "Tiempo agotado: se envían tus respuestas automáticamente..."], ["Tes réponses sont enregistrées. Tu ne peux plus recomposer cette épreuve.", "Your answers are saved. You can no longer retake this test.", "Tus respuestas están guardadas. Ya no puedes repetir esta prueba."], ["Ton bulletin n'a pas encore été publié. Reviens bientôt.", "Your report card has not been published yet. Come back soon.", "Tu boletín aún no ha sido publicado. Vuelve pronto."], ["Ton profil élève n'est pas complet.", "Your student profile is incomplete.", "Tu perfil de estudiante está incompleto."], ["Trop de demandes SMS. Attends quelques minutes puis réessaie.", "Too many SMS requests. Wait a few minutes then try again.", "Demasiadas solicitudes de SMS. Espera unos minutos e inténtalo de nuevo."], ["Tu as répondu à toutes les questions. Envoyer tes réponses ?", "You have answered all the questions. Send your answers?", "Has respondido a todas las preguntas. ¿Enviar tus respuestas?"], ["Tu n'as droit qu'à une seule tentative.", "You only get one attempt.", "Solo tienes derecho a un intento."], ["Tu n'as droit qu'à une seule tentative. Le chronomètre démarre dès que tu appuies sur « Commencer ».", "You only get one attempt. The timer starts as soon as you tap “Start”.", "Solo tienes derecho a un intento. El cronómetro empieza en cuanto pulsas «Empezar»."], ["Téléphone", "Phone", "Teléfono"], ["Une erreur est survenue lors de la déconnexion.", "An error occurred while logging out.", "Se produjo un error al cerrar sesión."], ["Veux-tu vraiment te déconnecter ?", "Do you really want to log out?", "¿Seguro que quieres cerrar sesión?"], ["Voir le bulletin", "View report card", "Ver boletín"], ["Voir les cours", "View lessons", "Ver las clases"], ["Vérification de sécurité validée. Envoi du SMS...", "Security check passed. Sending the SMS...", "Verificación de seguridad superada. Enviando el SMS..."], ["Vérification des cours…", "Checking lessons…", "Comprobando las clases…"], ["Vérification...", "Checking...", "Comprobando..."], ["Éducation civique", "Civic education", "Educación cívica"], ["Épreuve", "Test", "Prueba"], ["Écris ta question ou joins la photo d'un exercice.", "Write your question or attach a photo of an exercise.", "Escribe tu pregunta o adjunta la foto de un ejercicio."], ["⏳ Ton inscription est en attente de validation par l'administrateur.", "⏳ Your registration is awaiting approval by the administrator.", "⏳ Tu registro está pendiente de validación por el administrador."], ["⛔ Ton compte est suspendu. Contacte l'administration.", "⛔ Your account is suspended. Contact the administration.", "⛔ Tu cuenta está suspendida. Contacta con la administración."], ["✅ Connexion réussie ! Redirection vers tes cours...", "✅ Logged in! Redirecting to your lessons...", "✅ ¡Sesión iniciada! Redirigiendo a tus clases..."], ["✏️ Écris d'abord ton adresse e-mail ci-dessus, puis clique à nouveau sur « Mot de passe oublié ? ».", "✏️ First write your email address above, then click “Forgot your password?” again.", "✏️ Escribe primero tu correo electrónico arriba y luego pulsa de nuevo «¿Olvidaste tu contraseña?»."], ["❌ Adresse e-mail ou mot de passe incorrect.", "❌ Incorrect email address or password.", "❌ Correo electrónico o contraseña incorrectos."], ["❌ Aucun compte ne correspond à cette adresse e-mail.", "❌ No account matches this email address.", "❌ Ninguna cuenta corresponde a este correo electrónico."], ["❌ Impossible d'envoyer l'e-mail de réinitialisation.", "❌ Unable to send the reset email.", "❌ No se puede enviar el correo de restablecimiento."], ["❌ Mot de passe incorrect.", "❌ Incorrect password.", "❌ Contraseña incorrecta."], ["❌ Ta demande d'inscription n'a pas été acceptée.", "❌ Your registration request was not accepted.", "❌ Tu solicitud de registro no fue aceptada."], ["❌ Trop de demandes. Attends quelques minutes puis réessaie.", "❌ Too many requests. Wait a few minutes then try again.", "❌ Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo."], ["🎤 Je t'écoute...", "🎤 I'm listening...", "🎤 Te escucho..."], ["Bénin : indépendance", "Benin: independence", "Benín: independencia"], ["Capitale : Porto-Novo", "Capital: Porto-Novo", "Capital: Porto-Novo"], ["Grande ville : Cotonou", "Largest city: Cotonou", "Ciudad más grande: Cotonou"], ["Le départ du 100 m", "The start of the 100 m", "La salida de los 100 m"], ["« À vos marques »", "“On your marks”", "«En sus marcas»"], ["« Prêts »", "“Set”", "«Listos»"], ["« Partez »", "“Go”", "«¡Ya!»"], ["Sujet : la liberté", "Topic: freedom", "Tema: la libertad"], ["Définis les termes", "Define the terms", "Define los términos"], ["Pose la problématique", "State the problem", "Plantea la problemática"], ["Construis ton plan", "Build your outline", "Construye tu plan"], ["← la méthode d’abord", "← method first", "← primero el método"], ["La photosynthèse", "Photosynthesis", "La fotosíntesis"], ["CO2 + eau + lumière", "CO2 + water + light", "CO2 + agua + luz"], ["donne du glucose + O2", "gives glucose + O2", "produce glucosa + O2"], ["dans les feuilles vertes", "in green leaves", "en las hojas verdes"], ["← la plante se nourrit", "← the plant feeds itself", "← la planta se alimenta"], ["Vitesse : v = d ÷ t", "Speed: v = d ÷ t", "Velocidad: v = d ÷ t"], ["← n’oublie pas l’unité", "← don't forget the unit", "← no olvides la unidad"], ["← retiens les dates clés", "← remember the key dates", "← recuerda las fechas clave"], ["Past simple : go → went", "Past simple: go → went", "Pasado simple: go → went"], ["← verbes irréguliers", "← irregular verbs", "← verbos irregulares"], ["« finir » au présent", "“finir” in the present tense", "«finir» en presente"], ["← radical : finiss-", "← stem: finiss-", "← raíz: finiss-"], ["le verbe « ser »", "the verb “ser”", "el verbo «ser»"], ["Le verbe « ser » (être)", "The verb “ser” (to be)", "El verbo «ser» (ser/estar)"], ["Le verbe « sein » (être)", "The verb “sein” (to be)", "El verbo «sein» (ser/estar)"], ["← verbe irrégulier", "← irregular verb", "← verbo irregular"], ["Cours disponible", "Lessons available", "Clases disponibles"], ["Gestion de classe", "Class management", "Gestión de clase"], ["SA1", "SA1", "SA1"], ["masculin", "masculine", "masculino"], ["féminin", "feminine", "femenino"], ["neutre", "neuter", "neutro"], ["sujet", "subject", "sujeto"], ["verbe", "verb", "verbo"], ["français", "French", "francés"], ["anglais", "English", "inglés"], ["espagnol", "Spanish", "español"], ["allemand", "German", "alemán"], ["philosophie", "philosophy", "filosofía"], ["histoire-géographie", "history and geography", "historia y geografía"], ["Hist-Géo", "Hist-Geo", "Hist-Geo"], ["Philo", "Philosophy", "Filosofía"], ["Ajoute une photo nette et bien à plat de ta carte d'identité (ou son PDF). Nous lisons automatiquement ton nom, ton/tes prénom(s) et ta date de naissance pour préremplir le formulaire —", "Add a clear, flat photo of your ID card (or its PDF). We automatically read your last name, first name(s) and date of birth to pre-fill the form —", "Añade una foto nítida y plana de tu documento de identidad (o su PDF). Leemos automáticamente tu apellido, nombre(s) y fecha de nacimiento para rellenar el formulario —"], ["Le document officiel de ma classe, avec toutes les matières. Je peux le voir ici, puis le télécharger en PDF.", "The official document of my class, with all the subjects. I can view it here, then download it as a PDF.", "El documento oficial de mi clase, con todas las asignaturas. Puedo verlo aquí y luego descargarlo en PDF."], ["Enseignant du secondaire dans la Commune de Karimama, au Bénin, ALOUKOU Sèminvo Armel est à l’origine du projet Campus Flex, une initiative née de sa volonté de rendre un enseignement de qualité accessible à chaque élève francophone, où qu’il se trouve. Porté par un engagement constant pour la réussite scolaire, la plateforme accompagne aussi bien les élèves en difficulté que ceux en rattrapage ou les candidats libres, avec l’ambition de faire de l’excellence académique un droit pour tous.", "A secondary school teacher in the Commune of Karimama, Benin, ALOUKOU Sèminvo Armel is the founder of the Campus Flex project, an initiative born from his wish to make quality education accessible to every French-speaking student, wherever they are. Driven by a constant commitment to academic success, the platform supports struggling students as well as those catching up and independent candidates, with the ambition of making academic excellence a right for everyone.", "Profesor de secundaria en la comuna de Karimama, en Benín, ALOUKOU Sèminvo Armel es el iniciador del proyecto Campus Flex, una iniciativa nacida de su deseo de hacer accesible una enseñanza de calidad a cada estudiante francófono, esté donde esté. Impulsada por un compromiso constante con el éxito escolar, la plataforma acompaña tanto a los estudiantes con dificultades como a quienes se están poniendo al día y a los candidatos libres, con la ambición de hacer de la excelencia académica un derecho para todos."], ["Officielle", "Official", "Oficial"], ["Blanche", "Practice", "Práctica"]];

  // Matières, pays et mots utilisés en fin de phrase
  var PAYS = [["Algérie", "Algeria", "Argelia"], ["Belgique", "Belgium", "Bélgica"], ["Burkina Faso", "Burkina Faso", "Burkina Faso"], ["Bénin", "Benin", "Benín"], ["Cameroun", "Cameroon", "Camerún"], ["Canada", "Canada", "Canadá"], ["Centrafrique", "Central African Republic", "República Centroafricana"], ["Comores", "Comoros", "Comoras"], ["Congo-Brazzaville", "Congo-Brazzaville", "Congo-Brazzaville"], ["Côte d’Ivoire", "Ivory Coast", "Costa de Marfil"], ["Djibouti", "Djibouti", "Yibuti"], ["France", "France", "Francia"], ["Gabon", "Gabon", "Gabón"], ["Guinée", "Guinea", "Guinea"], ["Haïti", "Haiti", "Haití"], ["Liberia", "Liberia", "Liberia"], ["Luxembourg", "Luxembourg", "Luxemburgo"], ["Madagascar", "Madagascar", "Madagascar"], ["Mali", "Mali", "Malí"], ["Maroc", "Morocco", "Marruecos"], ["Maurice", "Mauritius", "Mauricio"], ["Mauritanie", "Mauritania", "Mauritania"], ["Niger", "Niger", "Níger"], ["RDC - Congo-Kinshasa", "DR Congo - Congo-Kinshasa", "RD del Congo - Congo-Kinsasa"], ["Rwanda", "Rwanda", "Ruanda"], ["Seychelles", "Seychelles", "Seychelles"], ["Suisse", "Switzerland", "Suiza"], ["Sénégal", "Senegal", "Senegal"], ["Tchad", "Chad", "Chad"], ["Togo", "Togo", "Togo"], ["Tunisie", "Tunisia", "Túnez"]];

  // Phrases avec des valeurs variables : $1, $2... sont recopiés (et traduits s'ils figurent au dictionnaire)
  var MOTIFS = [[/^Il te reste (\d+) questions? sans réponse\. Envoyer quand même \?$/, "You have $1 unanswered question(s). Send anyway?", "Te quedan $1 pregunta(s) sin responder. ¿Enviar de todos modos?"],[/^(\d+) \/ (\d+) répondues?$/, "$1 / $2 answered", "$1 / $2 respondidas"],[/^Temps restant : (.+)$/, "Time left: $1", "Tiempo restante: $1"],[/^Corrigé disponible le (.+)$/, "Answer key available on $1", "Solucionario disponible el $1"],[/^Ta classe : (.+)$/, "Your class: $1", "Tu clase: $1"],[/^Classe : (.+) \| Moyenne : (.+) \| Rang : (.+)$/, "Class: $1 | Average: $2 | Rank: $3", "Clase: $1 | Media: $2 | Puesto: $3"],[/^Classe : (.+)$/, "Class: $1", "Clase: $1"],[/^Classe non reconnue : (.+)$/, "Class not recognised: $1", "Clase no reconocida: $1"],[/^Cette matière n'est pas au programme de ta classe \((.+)\)\.$/, "This subject is not part of your class curriculum ($1).", "Esta asignatura no está en el programa de tu clase ($1)."],[/^Cours, exercices et évaluations (?:de |d')(.+)\.$/, "Lessons, exercises and tests for $1.", "Clases, ejercicios y evaluaciones de $1."],[/^Choisis ta classe pour accéder aux cours, exercices et évaluations (?:de |d')(.+)\.$/, "Choose your class to access $1 lessons, exercises and tests.", "Elige tu clase para acceder a las clases, ejercicios y evaluaciones de $1."],[/^Salut (.+) !$/, "Hi $1!", "¡Hola $1!"],[/^Question (\d+) : (.+)$/, "Question $1: $2", "Pregunta $1: $2"],[/^(\d+) évaluations? · moyenne (\d+) %$/, "$1 test(s) · average $2 %", "$1 evaluación(es) · media $2 %"],[/^(\d+) évaluations?$/, "$1 test(s)", "$1 evaluación(es)"],[/^Faite (\d+) fois · meilleur score (.+)$/, "Done $1 time(s) · best score $2", "Hecha $1 vez/veces · mejor puntuación $2"],[/^Déjà composée · (.+)$/, "Already taken · $1", "Ya realizada · $1"],[/^Devoirs — (.+)$/, "Homework — $1", "Tareas — $1"],[/^Évaluation blanche — (.+)$/, "Practice test — $1", "Examen de práctica — $1"],[/^Évaluation officielle — (.+)$/, "Official test — $1", "Evaluación oficial — $1"],[/^Aucun devoir disponible pour le moment pour ta classe \((.+)\)\.$/, "No homework available right now for your class ($1).", "No hay tareas disponibles por ahora para tu clase ($1)."],[/^Aucune épreuve disponible pour ta classe \((.+)\) dans cette matière pour le moment\.$/, "No tests available for your class ($1) in this subject right now.", "No hay pruebas disponibles para tu clase ($1) en esta asignatura por ahora."],[/^Devoirs disponibles pour ta classe \((.+)\) :$/, "Homework available for your class ($1):", "Tareas disponibles para tu clase ($1):"],[/^Commencer \((\d+) min\)$/, "Start ($1 min)", "Empezar ($1 min)"],[/^Bulletin du semestre (\d+) - (.+)$/, "Report card for semester $1 - $2", "Boletín del semestre $1 - $2"],[/^Télécharger le devoir \((PDF|Word)\)$/, "Download the homework ($1)", "Descargar la tarea ($1)"],[/^(.+) · (\d+) questions? · (\d+) min$/, "$1 · $2 question(s) · $3 min", "$1 · $2 pregunta(s) · $3 min"],[/^(.+) · Sujet à consulter · (\d+) min$/, "$1 · Paper to view · $2 min", "$1 · Enunciado para consultar · $2 min"],[/^(\d+) questions?$/, "$1 question(s)", "$1 pregunta(s)"],[/^(\d+) jours?$/, "$1 day(s)", "$1 día(s)"],[/^Un code a été envoyé au (.+)\.$/, "A code was sent to $1.", "Se envió un código al $1."],[/^Français — (Lecture|Communication écrite)$/, "French — $1", "Francés — $1"],[/^(.+) · (\d+) questions?$/, "$1 · $2 question(s)", "$1 · $2 pregunta(s)"]];


  var CLE_THEME = "cf_theme", CLE_LANGUE = "cf_lang";
  var DEFAUT = "#2c3e8c";

  /* ------------------------------------------------------------------ */
  /* COULEURS                                                            */
  /* ------------------------------------------------------------------ */
  var PALETTES = [
    { id: "indigo",   p: "#2c3e8c", a: "#f39c12", nom: { fr: "Indigo",    en: "Indigo",    es: "Índigo" } },
    { id: "vert",     p: "#1b6b3a", a: "#f2b01e", nom: { fr: "Vert",      en: "Green",     es: "Verde" } },
    { id: "turquoise",p: "#0f6e7a", a: "#f2994a", nom: { fr: "Turquoise", en: "Teal",      es: "Turquesa" } },
    { id: "violet",   p: "#5b3a9a", a: "#f39c12", nom: { fr: "Violet",    en: "Purple",    es: "Violeta" } },
    { id: "bordeaux", p: "#8e2438", a: "#f1b24a", nom: { fr: "Bordeaux",  en: "Burgundy",  es: "Granate" } },
    { id: "orange",   p: "#b5480f", a: "#ffd166", nom: { fr: "Orange",    en: "Orange",    es: "Naranja" } },
    { id: "rose",     p: "#a8326f", a: "#f6c744", nom: { fr: "Rose",      en: "Pink",      es: "Rosa" } },
    { id: "ardoise",  p: "#3d4756", a: "#f39c12", nom: { fr: "Ardoise",   en: "Slate",     es: "Pizarra" } }
  ];
  var VARS_ADMIN = ["--ink", "--indigo", "--btn-bg", "--ruban", "--amber", "--hl"];
  var VARS_TOUT = VARS_ADMIN.concat(["--btn-fg", "--bg", "--paper", "--card", "--grid", "--line", "--text", "--muted"]);

  function hex2rgb(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function rgb2hex(r) { return "#" + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  // mélange : t = part de la couleur b
  function melange(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return rgb2hex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; })); }
  function luminance(h) { var c = hex2rgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }

  function lireTheme() {
    try { var t = JSON.parse(localStorage.getItem(CLE_THEME) || "{}"); return { preset: t.preset || "indigo", custom: t.custom || "" }; }
    catch (e) { return { preset: "indigo", custom: "" }; }
  }
  function ecrireTheme(t) { try { localStorage.setItem(CLE_THEME, JSON.stringify(t)); } catch (e) {} }
  function palette(id) { for (var i = 0; i < PALETTES.length; i++) { if (PALETTES[i].id === id) { return PALETTES[i]; } } return PALETTES[0]; }

  function estAdmin() { return !!document.querySelector('link[href*="campus-admin.css"]'); }

  function jeuClair(p, a) {
    var texte = melange(p, "#000000", .55);
    return { "--ink": p, "--indigo": p, "--btn-bg": p, "--btn-fg": "#ffffff", "--ruban": p, "--amber": a,
      "--hl": melange(a, "#ffffff", .82), "--bg": "#ffffff", "--paper": melange(p, "#ffffff", .94), "--card": "#ffffff",
      "--grid": melange(p, "#ffffff", .82), "--line": melange(p, "#ffffff", .66), "--text": texte, "--muted": melange(texte, "#ffffff", .3) };
  }
  function jeuSombre(p, a) {
    var bg = melange(p, "#000000", .65), clair = melange(p, "#ffffff", .62);
    return { "--ink": clair, "--indigo": clair, "--btn-bg": clair, "--btn-fg": bg, "--ruban": p, "--amber": a,
      "--hl": melange(a, "#000000", .8), "--bg": bg, "--paper": melange(p, "#000000", .55), "--card": bg,
      "--grid": melange(p, "#000000", .4), "--line": melange(p, "#000000", .3), "--text": melange(p, "#ffffff", .92), "--muted": melange(p, "#ffffff", .65) };
  }

  function appliquerCouleurs() {
    var t = lireTheme(), racine = document.documentElement.style, pal = palette(t.preset);
    var defaut = (t.preset === "indigo" && !t.custom);
    if (defaut) { VARS_TOUT.forEach(function (v) { racine.removeProperty(v); }); majMeta(DEFAUT); return; }
    var p = t.custom || pal.p;
    if (luminance(p) > .45) { p = melange(p, "#000000", .4); }   // reste assez foncé pour le texte blanc
    var admin = estAdmin();
    var sombre = !admin && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var jeu = sombre ? jeuSombre(p, pal.a) : jeuClair(p, pal.a);
    var liste = admin ? VARS_ADMIN : VARS_TOUT;
    liste.forEach(function (v) { racine.setProperty(v, jeu[v]); });
    majMeta(p);
  }
  function majMeta(c) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) { m.setAttribute("content", c); }
  }

  var STYLE_FORCE = "header.barre,body>nav,body>footer,footer{background:var(--ruban,#2c3e8c)!important}" +
    ".card,.carte{border-color:var(--ink,#2c3e8c)!important}.salut{color:var(--ink,#2c3e8c)!important}" +
    ".boite-ajout{border-color:var(--ink,#2c3e8c)!important}.btn-lien{background:var(--ink,#2c3e8c)!important}";
  var st = document.createElement("style");
  st.id = "cf-theme-force"; st.textContent = STYLE_FORCE;
  (document.head || document.documentElement).appendChild(st);
  appliquerCouleurs();
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) { mq.addEventListener("change", appliquerCouleurs); }
  }

  /* ------------------------------------------------------------------ */
  /* LANGUE                                                              */
  /* ------------------------------------------------------------------ */
  var langue = "fr";
  try { langue = localStorage.getItem(CLE_LANGUE) || ""; } catch (e) {}
  if (["fr", "en", "es"].indexOf(langue) === -1) { langue = "fr"; }   // par défaut : français

  function norm(t) { return String(t).replace(/[\u2019\u2018]/g, "'").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }

  var DICO = { en: {}, es: {} };
  (function () { for (var i = 0; i < LIGNES.length; i++) { var l = LIGNES[i]; DICO.en[norm(l[0])] = l[1]; DICO.es[norm(l[0])] = l[2]; } })();
  var LIBRE = { en: {}, es: {} }; // traductions des mots du pied de phrase (matières, pays)
  (function () { for (var i = 0; i < PAYS.length; i++) { var l = PAYS[i]; LIBRE.en[norm(l[0])] = l[1]; LIBRE.es[norm(l[0])] = l[2]; } })();

  function sub(g) {
    var n = norm(g), d = DICO[langue][n];
    return d !== undefined ? d : g;
  }
  function chercher(n) {
    var d = DICO[langue][n];
    if (d !== undefined) { return d; }
    for (var i = 0; i < MOTIFS.length; i++) {
      var m = n.match(MOTIFS[i][0]);
      if (m) {
        return MOTIFS[i][langue === "en" ? 1 : 2].replace(/\$(\d)/g, function (x, k) { return sub(m[k]); });
      }
    }
    var p = n.match(/^(.+) \((\+\d+)\)$/);
    if (p && LIBRE[langue][norm(p[1])]) { return LIBRE[langue][norm(p[1])] + " (" + p[2] + ")"; }
    return null;
  }
  function traduire(txt) {
    if (langue === "fr") { return txt; }
    var n = norm(txt);
    if (!n) { return txt; }
    var r = chercher(n);
    if (r === null) { return txt; }
    var m = txt.match(/^(\s*)[\s\S]*?(\s*)$/);
    return m[1] + r + m[2];
  }

  var ATTRS = ["placeholder", "aria-label", "title", "alt"];
  var EXCLUS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
  var infoTexte = new WeakMap(), infoAttr = new WeakMap(), titreOrig = null, titreMontre = null;

  function exclu(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (EXCLUS[e.tagName] || e.getAttribute("translate") === "no" || (e.classList && e.classList.contains("notranslate")) || e.id === "cf-app") { return true; }
    }
    return false;
  }
  function noeudTexte(n) {
    if (!n.parentNode || exclu(n.parentNode)) { return; }
    var info = infoTexte.get(n);
    if (!info) { info = { orig: n.nodeValue, montre: n.nodeValue }; infoTexte.set(n, info); }
    else if (n.nodeValue !== info.montre) { info.orig = n.nodeValue; }
    var t = traduire(info.orig);
    if (t !== n.nodeValue) { n.nodeValue = t; }
    info.montre = n.nodeValue;
  }
  function attribut(el, a) {
    if (!el.hasAttribute(a) || exclu(el)) { return; }
    var tous = infoAttr.get(el); if (!tous) { tous = {}; infoAttr.set(el, tous); }
    var info = tous[a], val = el.getAttribute(a);
    if (!info) { info = { orig: val, montre: val }; tous[a] = info; }
    else if (val !== info.montre) { info.orig = val; }
    var t = traduire(info.orig);
    if (t !== val) { el.setAttribute(a, t); }
    info.montre = el.getAttribute(a);
  }
  function arbre(racine) {
    if (!racine) { return; }
    if (racine.nodeType === 3) { noeudTexte(racine); return; }
    if (racine.nodeType !== 1 || exclu(racine)) { return; }
    var w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, null, false), n, liste = [];
    while ((n = w.nextNode())) { liste.push(n); }
    liste.forEach(noeudTexte);
    var els = racine.querySelectorAll ? racine.querySelectorAll("[placeholder],[aria-label],[title],[alt]") : [];
    ATTRS.forEach(function (a) { if (racine.hasAttribute && racine.hasAttribute(a)) { attribut(racine, a); } });
    Array.prototype.forEach.call(els, function (el) { ATTRS.forEach(function (a) { attribut(el, a); }); });
  }
  function titre() {
    var t = document.title;
    if (titreOrig === null) { titreOrig = t; titreMontre = t; }
    else if (t !== titreMontre) { titreOrig = t; }
    var n = traduire(titreOrig);
    if (n !== t) { document.title = n; }
    titreMontre = document.title;
  }
  function toutTraduire() {
    if (!document.body) { return; }
    arbre(document.body); titre();
    document.documentElement.lang = langue;
  }

  var observateur = null;
  function observer() {
    if (observateur || !window.MutationObserver || !document.body) { return; }
    observateur = new MutationObserver(function (liste) {
      liste.forEach(function (m) {
        if (m.type === "childList") { Array.prototype.forEach.call(m.addedNodes, arbre); }
        else if (m.type === "characterData") { noeudTexte(m.target); }
        else if (m.type === "attributes") { attribut(m.target, m.attributeName); }
      });
      titre();
    });
    observateur.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function definirLangue(l) {
    langue = l;
    try { localStorage.setItem(CLE_LANGUE, l); } catch (e) {}
    toutTraduire(); observer(); majInterface();
  }

  // Éviter un éclair de français avant la traduction
  if (langue !== "fr") {
    document.documentElement.classList.add("cf-attente");
    var s2 = document.createElement("style");
    s2.textContent = "html.cf-attente body{visibility:hidden}";
    (document.head || document.documentElement).appendChild(s2);
    setTimeout(function () { document.documentElement.classList.remove("cf-attente"); }, 1500);
  }

  /* ------------------------------------------------------------------ */
  /* BOUTON ET FEUILLE « APPARENCE »                                     */
  /* ------------------------------------------------------------------ */
  var TXT = {
    fr: { bouton: "Couleur et langue", couleur: "Couleur", autre: "Autre couleur", langue: "Langue", fermer: "Fermer",
          note: "L’interface est traduite. Les cours restent en français." },
    en: { bouton: "Colour and language", couleur: "Colour", autre: "Other colour", langue: "Language", fermer: "Close",
          note: "The interface is translated. Lessons stay in French." },
    es: { bouton: "Color e idioma", couleur: "Color", autre: "Otro color", langue: "Idioma", fermer: "Cerrar",
          note: "Se traduce la interfaz. Las clases siguen en francés." }
  };
  var LANGUES = [["fr", "Français"], ["en", "English"], ["es", "Español"]];
  var feuille = null, bouton = null;

  function majInterface() {
    if (!bouton) { return; }
    var t = TXT[langue], th = lireTheme();
    bouton.setAttribute("aria-label", t.bouton); bouton.title = t.bouton;
    feuille.querySelector("[data-t=couleur]").textContent = t.couleur;
    feuille.querySelector("[data-t=autre]").firstChild.nodeValue = t.autre + " ";
    feuille.querySelector("[data-t=langue]").textContent = t.langue;
    feuille.querySelector("[data-t=note]").textContent = t.note;
    feuille.querySelector("[data-t=fermer]").setAttribute("aria-label", t.fermer);
    Array.prototype.forEach.call(feuille.querySelectorAll("[data-pal]"), function (b) {
      var p = palette(b.getAttribute("data-pal"));
      b.setAttribute("aria-label", p.nom[langue]); b.title = p.nom[langue];
      b.setAttribute("aria-pressed", (!th.custom && th.preset === p.id) ? "true" : "false");
    });
    Array.prototype.forEach.call(feuille.querySelectorAll("[data-lang]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === langue ? "true" : "false");
    });
    var c = feuille.querySelector("input[type=color]");
    c.value = th.custom || palette(th.preset).p;
  }

  function construire() {
    if (document.getElementById("cf-app")) { return; }
    var css = document.createElement("style");
    css.textContent =
      "#cf-app{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9990;font:15px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      "#cf-app button{font:inherit}" +
      "#cf-bouton{width:48px;height:48px;border-radius:50%;border:2px solid #fff;background:var(--ruban,#2c3e8c);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3);padding:0}" +
      "#cf-bouton:focus-visible,#cf-feuille button:focus-visible,#cf-feuille input:focus-visible{outline:3px solid #f39c12;outline-offset:2px}" +
      "#cf-feuille{position:absolute;left:0;bottom:60px;width:min(300px,calc(100vw - 28px));padding:16px;border-radius:14px;background:var(--card,#fff);color:var(--text,#14203F);border:2px solid var(--ink,#2c3e8c);box-shadow:0 6px 24px rgba(0,0,0,.3)}" +
      "#cf-feuille[hidden]{display:none}" +
      "#cf-feuille h2{font-size:.85rem;font-weight:800;margin:0 0 8px;color:var(--ink,#2c3e8c)}" +
      "#cf-feuille .pal{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}" +
      "#cf-feuille .pal button{width:38px;height:38px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0}" +
      "#cf-feuille .pal button[aria-pressed=true]{border-color:var(--text,#14203F);box-shadow:0 0 0 2px var(--card,#fff) inset}" +
      "#cf-feuille label{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-weight:600}" +
      "#cf-feuille input[type=color]{width:42px;height:34px;border:2px solid var(--line,#AEBBDA);border-radius:8px;padding:0;background:none}" +
      "#cf-feuille .lang{display:flex;gap:8px;margin-bottom:12px}" +
      "#cf-feuille .lang button{flex:1 1 0;min-width:0;padding:0 4px;white-space:nowrap;min-height:42px;border-radius:10px;border:2px solid var(--ink,#2c3e8c);background:transparent;color:var(--ink,#2c3e8c);font-weight:700;cursor:pointer}" +
      "#cf-feuille .lang button[aria-pressed=true]{background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff)}" +
      "#cf-feuille .note{margin:0;font-size:.8rem;color:var(--muted,#46547A)}" +
      "#cf-fermer{position:absolute;right:8px;top:6px;border:0;background:none;color:var(--muted,#46547A);font-size:1.4rem;cursor:pointer;line-height:1;padding:6px}";
    document.head.appendChild(css);

    var app = document.createElement("div"); app.id = "cf-app"; app.setAttribute("translate", "no");
    var pal = PALETTES.map(function (p) {
      return '<button type="button" data-pal="' + p.id + '" style="background:' + p.p + '"></button>';
    }).join("");
    var lg = LANGUES.map(function (l) { return '<button type="button" data-lang="' + l[0] + '">' + l[1] + "</button>"; }).join("");
    app.innerHTML =
      '<button type="button" id="cf-bouton"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-.6-.3-1-.6-1.4-.4-.5-.4-1.6.9-1.6H17a4 4 0 0 0 4-4c0-4.4-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/></svg></button>' +
      '<div id="cf-feuille" role="dialog" hidden><button type="button" id="cf-fermer" data-t="fermer">×</button>' +
      '<h2 data-t="couleur"></h2><div class="pal">' + pal + '</div>' +
      '<label data-t="autre">x <input type="color"></label>' +
      '<h2 data-t="langue"></h2><div class="lang">' + lg + '</div><p class="note" data-t="note"></p></div>';
    document.body.appendChild(app);
    bouton = document.getElementById("cf-bouton"); feuille = document.getElementById("cf-feuille");
    if (estAdmin()) { feuille.querySelector("[data-t=langue]").style.display = "none"; feuille.querySelector(".lang").style.display = "none"; feuille.querySelector(".note").style.display = "none"; }

    bouton.addEventListener("click", function () { feuille.hidden = !feuille.hidden; });
    document.getElementById("cf-fermer").addEventListener("click", function () { feuille.hidden = true; });
    document.addEventListener("click", function (e) { if (!app.contains(e.target)) { feuille.hidden = true; } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { feuille.hidden = true; } });
    Array.prototype.forEach.call(feuille.querySelectorAll("[data-pal]"), function (b) {
      b.addEventListener("click", function () { ecrireTheme({ preset: b.getAttribute("data-pal"), custom: "" }); appliquerCouleurs(); majInterface(); });
    });
    feuille.querySelector("input[type=color]").addEventListener("input", function (e) {
      ecrireTheme({ preset: lireTheme().preset, custom: e.target.value }); appliquerCouleurs(); majInterface();
    });
    Array.prototype.forEach.call(feuille.querySelectorAll("[data-lang]"), function (b) {
      b.addEventListener("click", function () { definirLangue(b.getAttribute("data-lang")); });
    });
    majInterface();
  }

  function demarrer() {
    construire();
    if (langue !== "fr") { toutTraduire(); observer(); }
    document.documentElement.classList.remove("cf-attente");
    if (langue !== "fr") { observer(); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", demarrer); } else { demarrer(); }

  window.CF_THEME = { langue: function () { return langue; }, definirLangue: definirLangue };

})();
