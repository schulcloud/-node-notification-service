'use strict';

const assert = require('assert');
const app = require('../../../src/app');

const User = require('../../../src/services/user/user-model');

describe('message service', function () {
  it('registered the messages service', () => {
    assert.ok(app.service('messages'));
  });

  it('rejects invalid authToken', () => {
    return app.service('messages').create({
      title: 'New Notification',
      body: 'You have a new Notification',
      token: 'invalidToken',
      scopeIds: [
        'userIdOrScopeId',
        'testScopeId'
      ]
    })
      .catch(err => {
        assert.equal(err.code, 401);
      });
  });

  it('sends a message to not existing user', () => {
    let id = '';
    return app.service('messages').create({
      title: 'New Notification',
      body: 'You have a new Notification',
      token: 'teacher1_1',
      scopeIds: [
        '316866a2-41c3-444b-b82c-274697c546a0'
      ]
    });
  });

  it('sends and get a message to existing user', () => {
    let id = '';
    let newUser = new User({
      applicationId: '373fd11a-4c42-48ac-b245-0aa922bc1cc9',
      devices: []
    });
    return newUser.save()
      .then(() => {
        return app.service('messages').create({
          title: 'New Notification',
          body: 'You have a new Notification',
          token: 'teacher1_1',
          scopeIds: [
            '316866a2-41c3-444b-b82c-274697c546a0'
          ]
        }).then(message => {
          id = message.data.id;
          return app.service('messages').get(id);
        }).then(message => {
          assert.equal(message.data.id, id);
        });
      });
  });

  it('sends a message to an existing user', () => {
    let newUser = new User({
      applicationId: '373fd11a-4c42-48ac-b245-0aa922bc1cc9',
      devices: []
    });

    return newUser
      .save()
      .then(user => {
        return app.service('messages').create({
          title: 'New Notification',
          body: 'You have a new Notification',
          token: 'teacher1_1',
          scopeIds: [
            '373fd11a-4c42-48ac-b245-0aa922bc1cc9'
          ]
        })
      });
  });

  it('rejects title longer than 140 characters', () => {
    return app.service('messages').create({
      title: 'New Notification with very very very very very very very very very very very very very very very very very very very very very very long title',
      body: 'You have a new Notification',
      token: 'teacher1_1',
      scopeIds: [
        '316866a2-41c3-444b-b82c-274697c546a0'
      ]
    })
      .catch(err => {
        assert.equal(err.code, 400);
      });
  });

  it('rejects unauthorized user (1/2)', () => {
    return app.service('messages').create({
      title: 'New Notification',
      body: 'You have a new Notification',
      token: 'student1_1',
      scopeIds: [
        '316866a2-41c3-444b-b82c-274697c546a0'
      ]
    })
      .catch(err => {
        assert.equal(err.code, 403);
      });
  });

  it('rejects unauthorized user (2/2)', () => {
    return app.service('messages').create({
      title: 'New Notification',
      body: 'You have a new Notification',
      token: 'teacher1_1',
      scopeIds: [
        '8b0753ab-6fa8-4f42-80bd-700fe8f7d66d'
      ]
    })
      .catch(err => {
        assert.equal(err.code, 403);
      });
  });

  it('rejects too big payload', () => {
    return app.service('messages').create({
      title: 'New Notification',
      body: 'You have a new Notification',
      data: {
        toomuch: '3180246145729116745355760523401293788086083879921945500638380385340915367632345115596065224526443296572472578333591072425043024695537171536958323880903065042407483534863966159497241140276427518939769524880513499603323962653563865238264876321625255675465423685112907520595227991923722053579036539429297594832537863318487956500817778854696449043094397393000099024335444307318136787638973933801810805907524549322697168133626140680056247221764404915023406818811296180070189547633255674638990791736537678248582477814792829733282341773062899167128287364253749110580018783869496350428455782371293252562929602606922852753705965065168484640247882637114231574479523592538401152488048276802072022159433831192438996129410605114642482629711703625143332261032045373040699738700540749439347400005851095671232008918502217876398156572617411051752343203521041537579029783263871188183461384787149772924704495660712776906165650092458576289125419342892912591711245633971325774875806880536926617267170185210505578371146357998507709948567495812661186929312194269470942816586202769955195109938224985240853018517458013623599060875715482337373245030768635988427651734777640897831735797816738743272847670249064070583218502039021042742414287963745241146099580777694785752078773600868432123460415446622694660074632008973826193981431646814994612458555333210949633484674997406752655815193785560393690879860176342199695552049157362591059417996014731089795491056482998452552914487631877966586118974542722060866502060032320800227689168475468440485204579872230120043814535530806681776664570313161928473221115740050535303470345355916279518567312651831553633435025412093872790294748158146488302540414646827307241131626945206468707211077262413486693442545400246810710981208789675587043891314521982561491175940057864653203434154230581063007674009999646238155704449526821242741901230904612067207931130732553767362749352167500567745629585828869895642705814584625160314852219666763437580079613195586129383316816660503829380807285704320902061216831131127611078704274891307033788046806683019167985010523900844205019320887349129202155830748695765799387442619698085924138072880663178345372760761121992185023085236541804481680677530475421341092251264838426873810132182979881616459114746615424440221565148302338840274577746762422106275378496998434371098598586757053233759631989189626109274353776856773062269571785949504080872355228605618202000989206107457260988815284324257431549863043512933920243302318797781421846184161928023811882162937377557808823019989587235974650700983631048873710583177873281770267245985181251767836346677013404648876551473731365871131491225651642662967246521042204369174756092063136730826666567286712066745466633353751023569520979224653339305063589453247504733230781990771028648675907011839555904490554746602740156713242552520111076262287975647638568078848346414782169161010286695753216685085878659495400966350185408283538515480342684679935794753069043190367725194676891402697612135183343498716788775961632094152105768297653361060038795402995572815313367658505022688107692031731442849060043285426407156883479961639229399439451071689093683358832023320101294559059082973003572062228350907876741808398320973924152428292789604796754373853942119803674073841575438043765225274876307834722893769654875405594427580830425657107336604451625769034666523188299314285105475737417051935661473201997318904843741835184309611528300531804266115779755101469313384018538771645622580768263580089743608104332305869902967868578385048984069575979129064898286034936012457568721866308161369151305384431802942358078400938509294548829122829770602389860512579869317089963806753880910933670207201986560262103359691619919443834447074927314056511944633264258530515466206267894752299365095573094725692658466764006908245656574062677403794619999509880030747575256167843189043245345148897821528322671330566344816644460892419989907327544172322266800545152144176759631762351738730036499245736712808378000308897984869444509815758993117324010663398278372417106112'
      },
      token: 'teacher1_1',
      scopeIds: [
        '316866a2-41c3-444b-b82c-274697c546a0'
      ]
    })
      .catch(err => {
        assert.equal(err.code, 400);
      });
  })

});
