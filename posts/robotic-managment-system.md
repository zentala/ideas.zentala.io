pracujac z ROSem wpadlem na pomysl stworzenia GUI do jego konfiguracji
jego podstawowa konfiguracja to:
- URDF (plik opisujacy strukture robota wraz z jego modelem 3d)
- broker - sluzyacy do wymiany wiadomosci
- konfiguracja SLAM - mozna by ja dostarczac jako paczke

generalnie mozna stosunkwo latwo stworzyc gui dla robota

wyobrazam sobie ze moglby byc to system jak dla wordpressa
np kupiujesz robota turrtlebot i on od razu mam wgrany sytsem i UI
URDF stworzyl producent robota
masz kilka paczek SLAM z zestawiona nawigacja dla niego

wieszkosc pracy przy pierwszej konfiguracji robota to jak polacyzc to aby to wszystko dzialo
cos jak system zaleznosci dla linua - nie wiem czy pamietacie czasy ale kiedys w linux nie bylo package manageorw, np apt ale instalowalo sie paczki za pomoca pkgd albo kompilowalo... to bylo pieklo nie pasuacych zaleznosci. 
obecnie podobne pieklo mamy w ROS, a mozna by stworzyc system gdzie X paczek jest juz wstepnie skonfugoewanych i zestawionych ze soba

dalej idac mozna dodac rozne wtyczki np
- zarzadzane bateria, jej status, ladowanie, wyyczki do ich wyswietlania
- panel zdalnego sterowania robotem, i tak to rbimy ale bez gui
- panel z logami domyslnie
- panel odpalania okreslnych ackji na pojawienie sie okrelsonych logow
- w ogole automatyzajec zadan i jakies drzewa decyzjne sa slaba wspierane w ros

ogolnie robotyka jest na maxa slabo doinwestowana jesli chodzi o rozwoj orpgoramowania
a trzeba zrobic CMS dla robotow, czyli RMS
wtyczki, narzedzia debugudujace, pakiety

pakiet to grupa rozwiazan np do systemu ladowania i dokowania
albo do systemu touch scerena dla usera ktory interkatuje\
albo dla sensorow dotyku robota
albo dla glowy robota ktora ma sie ruszac 
albo dla oczu robotua ktore maja cos pokazywac
producenci moglinby tworzyc cale pakiety rozwiazan dookola robotyki wraz z sotware ktory latwo sie integruje z RMS

wowzas robotyka by znacznie poszla do przodu
