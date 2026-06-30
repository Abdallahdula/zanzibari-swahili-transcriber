import { MeetingSession } from "../types";

export const SAMPLE_MEETINGS: MeetingSession[] = [
  {
    id: "zanzibar-tourism-coop",
    title: "Kikao cha Ushirika wa Utalii Stone Town - Zanzibar Maritime & Spice Coop",
    date: "2026-06-22",
    duration: "39:12",
    context: "Kikao kikubwa cha wanachama wa ushirika wa utalii Stone Town kujadili mikakati ya kuboresha huduma za mashua, viongoza watalii katika maskani ya Forodhani, na masoko ya viungo vya asili.",
    summary: {
      overview: "Kikao hiki kilihusisha viongozi wa ushirika wa Stone Town (Khamis, Fatma, na Salim) wakijadili maendeleo ya ushirika wa utalii wa Forodhani kufuatia msimu mpya. Mambo makuu yaliyojadiliwa ni pamoja na ukarabati wa maskani zetu za wasanii, kuboresha 'viwalo' vya viongoza utalii kwa kuvaa nadhifu, kuzuia madalali wasio rasmi ('kuzengeana wateja'), na kuongeza maadili ya kazi. Makubaliano makubwa yalifikiwa kuhusu ushuru mpya wa doria na mkataba wa bima kwa wageni.",
      agenda: [
        "Kuboresha muonekano wa viongoza watalii na maskani zao Forodhani",
        "Kudhibiti madalali holela na tabia ya kuzengeana wateja bandarini",
        "Kuanzisha mfumo maalum wa kidijitali wa kurekodi kadi za uandikishaji watalii",
        "Bajeti ya ukarabati wa mashua doria za safari za Prison Island"
      ],
      decisions: [
        "Viongoza watalii wote watasajiliwa rasmi na kupewa vitambulisho vyenye QR code vya ushirika.",
        "Kuanzisha ushuru mdogo wa asilimia 5 kwa kila safari ya dhow ili kufadhili ukarabati wa maskani ya wasanii Forodhani.",
        "Halima na Salim watasimamia ununuzi wa sare mpya (viwalo maalum vya kiutamaduni) kutoka kiwanda cha nguo cha kijamii cha mtaa wa Hurumzi."
      ],
      actionItems: [
        {
          task: "Kukamilisha muundo wa kadi mpya za QR na vitambulisho kwa ajili ya viongoza utalii bandarini",
          assignee: "Fatma Bakhresa",
          status: "Pending"
        },
        {
          task: "Kununua vitambaa na kukata sare (viwalo) za ushirika katika ofisi ya Hurumzi",
          assignee: "Salim Ali",
          status: "In-Progress"
        },
        {
          task: "Kufanya kikao cha dharura na mamlaka ya bandari ya Malindi kuhusu udhibiti wa madalali wapya",
          assignee: "Khamis Juma",
          status: "Pending"
        },
        {
          task: "Kutayarisha chati ya bei elekezi ya safari za Prison Island na Sandbank",
          assignee: "Fatma Bakhresa",
          status: "Done"
        }
      ]
    },
    transcript: [
      {
        id: "t1",
        speaker: "Khamis Juma",
        timestamp: "00:03",
        text: "Haya, heri ya asubuhi jamani. Karibuni kwenye kikao chetu cha leo cha ushirika wa utalii hapa Stone Town. Nashukuru wote mmefika kwa wakati, hasa shehe wangu Salim, leo umewahi sana kuliko kawaida."
      },
      {
        id: "t2",
        speaker: "Salim Ali",
        timestamp: "00:18",
        text: "Asubuhi njema shehe Khamis. Ah, leo mambo yange bwana! Nilishindwa kabisa kulala tangu alfajiri, nilikuwa nazengea baadhi ya nyaraka muhimu pale ofisini Hurumzi ili tuweze kujadiliana kiroho safi."
      },
      {
        id: "t3",
        speaker: "Fatma Bakhresa",
        timestamp: "00:35",
        text: "Asante sana. Mimi naona kwanza tuanze na suala la kule Forodhani. Wageni sasa hivi wanalalamika kuhusu jinsi baadhi ya waongozaji wetu wanavyovalia. Lazima tupige viwalo vya adabu jamani, utalii wa Zanzibar unajulikana kwa maadili na heshima."
      },
      {
        id: "t4",
        speaker: "Khamis Juma",
        timestamp: "01:02",
        text: "Kweli kabisa dada Fatma. Vijana wetu wasiende kule Forodhani na mavazi ya ovyo. Lazima wapige viwalo vya heshima: kanzu safi au fulana maalum za ushirika wetu zenye kola. Siyo mtu anakwenda Forodhani amevaa vitu vya ajabu, inaharibu picha ya maskani yetu."
      },
      {
        id: "t5",
        speaker: "Salim Ali",
        timestamp: "01:28",
        text: "Kuhusu sare za viwalo hivyo mimi nimeshaongea na fundi cherehani wetu pale Mkunazini. Amekubali kutushonea sare 50 za mwanzo kwa bei nafuu sana. Mambo yange bwana, ametupa punguzo la asilimia ishirini."
      },
      {
        id: "t6",
        speaker: "Fatma Bakhresa",
        timestamp: "01:50",
        text: "Hiyo ni habari nzuri sana Salim! Suala la pili ni hili la kugombea wateja pale bandarini. Kila siku vijana wetu wanazengeana wateja pale Malindi. Wageni wakishuka tu melini, vijana kumi wanawakimbilia. Hiyo inawapa wageni hofu, lazima iishe."
      },
      {
        id: "t7",
        speaker: "Khamis Juma",
        timestamp: "02:14",
        text: "Huu ugonjwa wa kuzengeana wateja utatumalizia biashara. Mimi nasema hivi, kuanzia sasa tutaweka zamu maalum. Hakuna kukimbilia mgeni. Kila mtu atapokea watalii kwa mzunguko wake, kistaarabu bila kusukumana wala kupiga kelele bandarini."
      },
      {
        id: "t8",
        speaker: "Salim Ali",
        timestamp: "02:35",
        text: "Naunga mkono shehe Khamis! Yule mshkaji atakayekiuka hii sheria, basi tumfungie kufanya kazi hapa Forodhani kwa wiki nzima. Potezea habari ya kulindana, ushirika lazima uwe na nidhamu ya hali ya juu."
      },
      {
        id: "t9",
        speaker: "Fatma Bakhresa",
        timestamp: "02:59",
        text: "Safi sana. Vipi kuhusu ukarabati wa maskani yetu ya wasanii? Sasa hivi paa la makuti linavuja na tuko katikati ya msimu wa wageni."
      },
      {
        id: "t10",
        speaker: "Khamis Juma",
        timestamp: "03:15",
        text: "Suala hilo linafanyiwa kazi. Tumepata ufadhili kidogo kutoka mamlaka ya mji mkongwe, lakini bado kuna pengo la bajeti. Mimi naomba kila mmiliki wa mashua dhow achangie ushuru kidogo wa ushirika ili tujaze hiyo bajeti tufanye ukarabati mara moja kabla wageni hawajajaa maskani."
      },
      {
        id: "t11",
        speaker: "Salim Ali",
        timestamp: "03:38",
        text: "Kwani ukarabati huo unagharimu ngapi? Isije ikawa tunatozwa fedha nyingi halafu kazi haifanyiki sawasawa. Mimi sipendi mambo ya mzungu wa nne, tunataka uwazi wa kila shilingi."
      },
      {
        id: "t12",
        speaker: "Fatma Bakhresa",
        timestamp: "04:02",
        text: "Salim, kuondoa wasiwasi wako, mchanganuo wa gharama upo wazi kabisa kwenye folda hii niliyoshika hapa. Tutabandika mchanganuo huu pale kwenye ubao wa maskani Forodhani ili kila mtu asome na kujiridhisha. Tunafanya hivi kwa kiroho safi."
      }
    ],
    dialectGloss: [
      {
        word: "Mambo yange",
        meaningSwahili: "Mambo ni mazuri / Kila kitu kinaenda vizuri sana.",
        meaningEnglish: "Things are going extremely well / affairs are perfectly fine.",
        explanation: "Ni msemo maarufu wa kisiwani Zanzibar (hasa vijana na wamiliki wa maskani) unaotumiwa kuashiria kuwa mambo yako sawa na hakuna matatizo.",
        exampleSentence: "Nilishindwa kabisa kulala tangu alfajiri, leo mambo yange bwana!"
      },
      {
        word: "Viwalo",
        meaningSwahili: "Nguo za kifahari / Mavazi yaliyopendeza.",
        meaningEnglish: "Elegant clothes / stylish outfit / attire.",
        explanation: "Neno hili linatumika nchini Zanzibar na maeneo ya Pwani kumaanisha nguo au sare rasmi za kujiheshimu, likiwa na msisitizo wa kupendeza na kuvaa nadhifu.",
        exampleSentence: "Lazima tupige viwalo vya adabu jamani, utalii wa Zanzibar unajulikana kwa maadili."
      },
      {
        word: "Kuzengea",
        meaningSwahili: "Kutafuta kwa bidii / Kutafuta fursa au wateja.",
        meaningEnglish: "To actively search for, look out for, or hunt for opportunities/customers.",
        explanation: "Zengea ni kitenzi cha kipekee cha Kiswahili cha Zanzibar kumaanisha 'kutafuta' au 'kuchunguza'. Katika muktadha wa kibiashara, inamaanisha kusaka wateja au fursa kibinafsi.",
        exampleSentence: "Nilikuwa nazengea baadhi ya nyaraka muhimu pale ofisini Hurumzi."
      },
      {
        word: "Maskani",
        meaningSwahili: "Kituo cha kukutana cha kijamii / Sehemu ya kijiwe rasmi.",
        meaningEnglish: "A structured community social center or local meeting hangout spot.",
        explanation: "Nchini Zanzibar, maskani si sehemu tu ya kukaa, bali ni taasisi ya kijamii iliyojengwa makusudi ambapo watu hukutana kunywa gahawa, kusoma magazeti, na kufanya mijadala muhimu ya kijamii na kiuchumi.",
        exampleSentence: "Siyo mtu anakwenda Forodhani amevaa vibaya, inaharibu picha ya maskani yetu."
      },
      {
        word: "Shehe",
        meaningSwahili: "Rafiki / Mzee wa vizazi / Kiongozi wa kidini (kwa matumizi ya kawaida ya heshima ya pwani).",
        meaningEnglish: "Friend / brother / elder / respected gentleman (coastal slang).",
        explanation: "Ingawa neno 'Shehe' (kutoka Kiarabu 'Sheikh') linamaanisha kiongozi wa kidini, huko Zanzibar linatumika sana kama jina la heshima ya kirafiki kwa kuita mwanaume anayeheshimika au rafiki wa karibu, kama vile mshkaji.",
        exampleSentence: "Asubuhi njema shehe Khamis."
      },
      {
        word: "Kiroho safi",
        meaningSwahili: "Kwa nia njema / bila chuki au nongwa / kwa amani.",
        meaningEnglish: "In good faith / with a pure heart / peacefully / amicably.",
        explanation: "Kiroho safi ni msemo wa pwani kuashiria makubaliano yasiyo na kinyongo, uwazi kamili, au kutenda jambo kwa uaminifu usio na shaka.",
        exampleSentence: "Nilikuwa nazengea nyaraka ili tuweze kujadiliana kiroho safi."
      },
      {
        word: "Mzungu wa nne",
        meaningSwahili: "Mambo ya kijanja janja / siri siri au ukosefu wa uwazi.",
        meaningEnglish: "Lack of transparency / suspicious dealing / behind-the-scenes trickery.",
        explanation: "Msemo wa kejeli / slang inayotumiwa kisiwani kuashiria mpango wenye mambo yasiyoeleweka au ya siri yaliyofunikwa bila uwazi kwa washiriki wote.",
        exampleSentence: "Mimi sipendi mambo ya mzungu wa nne, tunataka uwazi wa kila shilingi."
      },
      {
        word: "Potezea",
        meaningSwahili: "Puuza / Achana nayo / Usijali.",
        meaningEnglish: "Ignore / dismiss / let it slide / drop it.",
        explanation: "Slang inayotumiwa sana kupuuza tatizo au kupuuza hoja serves as a quick defense idiom to let something go without further dispute.",
        exampleSentence: "Potezea habari ya kulindana, ushirika lazima uwe na nidhamu ya hali ya juu."
      }
    ]
  }
];
