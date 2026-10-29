// noprotect
const COLS = 143, ROWS = 172, CELL = 4;
const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const PAL = ["fefcec","fefbda","fdf4e1","f8eae3","fef8c5","fdf2bb","fde9bf","fde9a2","f8e0ca","f3d6c7","e4d5dd","ddc9d5","fcda9f","fcda88","f9cb96","f9ca7b","ebbf9d","d8bcbd","f7bb73","ebb772","e5a878","e5a75c","dd9667","dc954e","ccb7c7","bbb3d7","c5a59c","aea5c8","b89994","c79465","a995a4","9394c4","d0875e","ce844b","ba8466","c07f4e","be7852","b9714d","b17254","af6b4c","9c8691","a27f6e","a06f5b","a36b49","8b7d96","8a6d6a","727db7","6d6d95","a36449","9d5e46","905f49","8e5540","815d52","815242","755758","615878","744a3d","6b4131","544151","453440","362b3d","29263f","221f32","171622"];
const DOTS = [
"bZZuuuuuufbYYYRYJIuuuuuuuuuuuuuuuvtpjjdhjpmXNHWVHFHHHFEEEFFFHFHFBEFHFFEEFFFHMNHFFHFNMBGPVTOTdTTdafuuuufufuuuufffffKDKKDDKJLLJJLICDCCLfZCDKKIYYZ",
"bbYYfuuuufbbbYJJGLuuuuuuuuuuuuuuuttpiWlWVddNNXPMNMHFHFEEEEHFHEFFBFFFFEEEFEEFHHHFHMFBGGEGPPVTWWdcceuuuufuufufuuufffZLDKKKJIIJIIIAACABIZZCIJILZZb",
"bbZKLuuuuuuufLGGbuuuuuuuuuuuuvuuvpiqqilVhjPOVTHHNMHFFHQciqypiMFFGEHHFBBEFBEFHFFHNMEBBMGAGSWVddgTdcfuuuuuubHauuuffbbZDDIIJCCCCIICAACDLLKDCIILYZb",
"bbbYLbZKfuuubYREYuuuuuuufuuuuuvstpimmjqijVFTTMNNHMHFQ05755qiiUUddidUQGBEFBEFFEFHMHBFFEEGBMUTUdjWUiauuuufeOHeuuuffZZKAAACCCCAAEECAADIIICCDLLLYYY",
"bbbYYbbKKuuuZueERuuuuuuuuufuuuuvqjmrmjjpWNPNEMNNMHMd48744yiiidy57554idUMEBEFEEFHHFFHEABMEEPVVddgTUaffbbbbRYuuuffZZKKAAAABDDABEECAACBCDCDJYYYLKI",
"bbbZYYbYCuufZfZIELuffuuuuuuuuuuttXhrmdWWSdhMFFFMNMp6775444ymidUmy58571dUGBBEBEFHFFHFBEFEMBGTdVWdTTWQabfffuuuuffbZKAKLZDADKKACBBCACACAJJJKLLKLDI",
"bbbbYLKJKfbZZLLJELuufbbfuuuuuuvtihrjXWiTNhTMPMFFHU487754kUUSPOMMMUk454iUdQBBEFFEEFEBFHFEFHFPTVVTVSVSRfuufffffZZKKLZZZZLZLKKDDACAACCDIQaRDIQILDI",
"ZZbbbZLDJKKbfKJCDfuuufffeRRuuuspiqqjWTdPPWHNNNMFMq78+4mWUSPPSPOMMHMSi11ddxQBEFEBEBBHHHFBENEHPTVVgVPWeuufbZZZZZZZZbbfbZbbKKDCAAACACIDQaooRQpYDDI",
"ZLYZYZbeaIAZfKIICZbuuuuuubYfbRddnmihjmUNTOHMMHNPp68+ygWUUUSSSPOMMMHHOm1rmiiGEEBBBBEFHFFFBMHFPTdWWSTdabbLLffffffbffffffZKKKCDAAAIACIBJeeppossLDJ",
"YZLYLLsvcRDZZDKJCIBZuuuuufffbQUTVdmWXXSOWMMNMEHq777yWWWUUUTSSPOOMMHGHUqimqyaEBCBBEEFHHHFBEPMNUXVPTPTTbbbbfufffffffffbbZDKDCAAAAJDBMaaceotcasDJR",
"uvRYeevspaLKKKDDDJBLuuuuuuufYQVTSSTVXTNTTMNHMHa7871gWWWUUUUTSPOOOMMHHOmrqzyrGABEEEFHHNHEEETNNWSNNNPPUabfbfuuffffffffbZZZKABAAABRacdacoecpUassos",
"uvuu333vsiQKKLADDDDZuuuuuuuuucUPPNHNSNNVMFMHFH2885igWWUUUUUUTSOOOOMHHMWr144mJAEBEFHHFEEFHFONFNHHNOPTUafffuufffffffbbbLZZDACADIQaaoeopceQossvvos",
"fbZs33vvviaaLKDDLCZuuuuuuuuuupigWSSNNHHPFFHNHd675qgggWUUUUUUTSOOMMMMMOUmy54qdEBEEEEEBBFFEEFNFHTPTddWdeffffuffffffbbZZKLKDAACIQaaccaeaaaosvsoaQe",
"vobuvs333cQRKKLYZLCbuuuuuuuuupdjqigVPNNHBEEFHd774miggWWUUUWUTOOMMMMMMMTm454iQGBEBBBBBBBEEEFSNPUVdiddUcfffffffffbbZDAAKDAAACCRQacaaescGQsv3vssvv",
"3333vvv33ocQKRLLLLBZfuuuuuuuupdmqjWVVNPPFFEEBp871mkkgWUUUUUUUdqyrmdTMMOdy51dQGBCCBBBBEFHHHFUPPVXjdmddcffffffffZZZKACCAAAACAADIJQMQeeoRevsvvvvuv",
"33v3tv3vveoceaKLLYCIIDuuuuuuuqiiqjXdXNPNHMHHFt88yqmjgWUTSTUUix15zkdWOMMTryqdqIAACBBEFHMMHHFTPNTdddjXdcffffffbZZZDAACCCAACAAAAIaaJbeesuusoovsuuf",
"vvvvtsvv3baeoQDKIKDCIAfuuuuuuqdWpiXdVNSOHNNNN4+81ymWWgWUSUUWimwmiWUTOMMOdqiddJABEEEEFFFFFEBMNHWWddWXdaZZZZZZLLZLCAAAAACACADJJQaabuvfubYoptoovvv",
"vvssovsvvbsvsooRLKDDADLKLuuuuiiiiidVSHTMEFHHO2874qmy55wmgUWgkwkUPOOTTOOMTidmUGBBBCBBBBEEEEBMNHXddjddUaZZZLZLKDAAAADDAIRCAADRRabebYaeeaaosvt3333",
"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",
"Kbv3vvuZZuuaYaQIKRACIDKKAKZKLffZbRRYDDCAIGDDIOQMMMFFTr4155yzxwwz45zxrkgWSTgWWMHUkgUOPVWWWWWUOHBABICIGFGEBCGMGGGGEFEBIDKDDKLDDLffbcZResssvvssssv",
"KfvvvsuZYbvaosUHRRCCCJDAAKLDZfffbZZDAAAAGCKKADIJGHUmz111554yxwnlwz1xwwlggWggWOHPhjhgVVWWWWWWWWTMBAEBBHTSHMMHOMBAABEGJJKDDACDDKZZaocovvvvsssssvf",
"ZuussebZes3333scoQCDbeDDCDCCLbbbbZKDAADBAAZKADAAQiy111115551xwnlklxznwxngWgggOMPWhhhgggWWWWWWWWWTMEBBMOMGGEPXXVOMGBBEGQGCCACIJJMMaotvsssseessvZ",
"ZuusssfZuvvuv33v3oAYsoYDKDDAKbLDDLKDDAIADZZKDDIUz0yz11z15454yxnlkkknnnnwjggggTMPThgghhggggWWWWWWXPGOTTTSMBBBOVghXVPGBEGPMAAABGMMQQMassoseKLeseK",
"LfssueZZfuvv33seeaYasfeIDKDACKLKACDDADIADZKDLQUw00yzzzz154451ynmkkkjknllkgggjUMSOTWgggggggggWSWXOMXjhgWVSGEGGOWgWWVSGBBGUQEICBBBIMMMRaesLCIesoA",
"ffeeebZbbuvvvveescecefaCDDAADDIKDACAADDAKKDLQOm0yyyzzzz151z41zxnkklkgjkkkggjkWOSOMMUgggggggjWVXMAUhkhggWWWUWWgWWgWUPHBBEGTPHCABEGMMQOMaoRCKYseA",
"YRMRebZbZuvuvvsvoaYeseJDRDAACDDCCAAABDDADARQMm0yyyzzzzz451z11yzrkkknlggkkjhjlgOTPOPSWggjggWWXVMBGhjkWWggWWggggWWgggWTOEEEMVNNHGMMQQQQQQaLDKJebC",
"DCBFQLLZbuvuvvsvaYDaseeeaIDKDBFCDAABBACADaXMd1yyzzzzzz1441zz1xxzlkklxlggklkkrkPTUHSSUWWWWUUWSHEEOWWhWggWWWWgggggggggggUMFFOQNVSGBIJRRRQQRIIIeeD",
"KCBCJZLbuvvu3vuuYYAYocsfbRJYKJEDCAABIDIIijdgxyzzzzzxxz154zyzzwmywkkkxzlgghnnxnSPhTMUWWUUWWgUEEMHMOOWggWWWgdWgjgggggggggWOFGIQOOQHGJRRRRQQEACRbK",
"LDCALLLfuuvuufufYLDbefubYeJKADDDAIaUSTUWUHdxx11zxwqwzzz454zzxkkzxkkknzxggVWwxnWMghTMUWgkggWOOWWPOOOOPSSWggdWWgggddddggggWMHGCIIRJJQQQQRQQMBCRRL",
"LKADCAAfuuvvufuZKYDbebubRYIDDDAKRdWWmnnnlWdnxxwwwmmmwywwxxxzxwxzxnllwzxjlgUgxxhOHWWPSUgggggWgjWWUSPOOMMMUgggdWggdddddggggUHMBCJQIJIGJMMIGGCAIDA",
"LLKLKEEfuuvuufuZKYDLYffZYYIKKZcqjSdyywrwxwnjgVSVhkmmmxzlkkkkkmmkmnlkkgWWWWTOWxnUUnljgWgWggWgkggjggTOOOMFFUgggddgkiidiiiighPMGBIQUQQGEGEEGGICACI",
"LLZZLSSUaJJfuufZLKAYbffZbYCDe00xWpywwmmkkkgVPNPPSXhkmnxxnkkgggkkgWgggggWWUPEMWkhhllnllgUWUOUhhgggWSOOOMMGHUgggdikkkggiiiikWMQIBBWgimVPMNNPXPMOI",
"bZZZYSSTSPBKfffbYKALfLZZZKBa20yx00qnmkggggWPPNMMNPSTWkwzrnnkjhknnkggggggkkgTMOOTggkwlgSgWSPPSWggggWUPOOMMOMUgkkiiiggiiimmkgPQQJGBOUXVMNFHHNPTgT",
"ZZZZfbTPHSTGbbfZLLDKbKKZLKc221z0ywmmgggggWSNPPPPPNPPPVnzxxnkjkmnmnlkggggggghUMVXWgkngTWkjggWWUWgggggWSOOOOOOSgkkkikkiiikmmkSTQQMMJMHHSPFMNPVXUX",
"ZbZfffbOHHaaZLKDKLDLLZKLKo22221ynmkkgggggWUUWggVSOMNPPWwzxkhgkmmmmmmjgjggWWVUSPSggjjWgkjjgggWUgggggggUSSPOOOOSWgkkllkkkkmmmgVUQGGMQQIGFHBFVTXUX",
"bZbbbbZLFCbfZDAADDAKZZKKet22220wrmkgggggggggggWWSPMMMMWlwxkhhlmmmmkhggggXXVVSSMGMPUgkljggggWSgggggggWUUUUPOOOOOWklmmnmmmmmmngOQQJGGQQJCEMMGGQQU",
"ZZbbZZZLBDZZKKDAADAKLZKYqt2220wwmkkgggggggggggWWSPMHHHWkkrjjkjkkjhjggggggXVVSSOGFPTUlkjggggWUgggggggWWUUUSPPOOOSgkmnnnnnnnqqkOEOQQJGMMJCACAGOQQ",
"KDZZYLDKKIKDDDCAAAADCDbqp3222qwmkkkgggggggggggWWSPMMHOgjjjhkkggggggggggggXVNSVSMGMWPWkjgggggkgjggggggWWUSSSPOOOOglmnrnnnnrqqkPFEMQQQQQQMMJJCIQT",
"LDKKKLKADCIGOGCDAAAAAD0032222qmmkkkggggggWWWggWWWTTTPUhjkjjjjhgjgggVVgggggXPVXWTPGOWTljgggggkjjjggigggWWUUSPOOOMUwnnwwnnwwqqkOSHFMQRRaQQQQQRAAI",
"LLZYKYZKCDCIOMIDDDDACp2232220mmkkkjggggggggWggggWggWVWhhhlnkhhgggggWWgggggXXXWWVTOOXOjjghgjjkjjjjiiigggWWUUSPOOMOkxwxywnwwqqmMSVMFQRRRaQQRRRJBB",
"ZZZLJYbLDLLDCDDDDDDAa2232022ymkkmkjgggggggggWWgjghhWghXSXhllkjgggghhhgggjjjjgWUSSSWhSWlhVhjlkkkjgiiigiidWUUUPOMMOgzx4xwyywqqkSTgVMMQRRQaaRRRRJJ",
"ffbLDLYLYYYKAAADKLADtt232000ymkmmkggggkgggggggggkhghjhSBThjjjhVWhhhWXgWXhjjjjgWVTOShjWlVMhjjjkjkkkkiiiigWUUUSOMMOW144xz1xqqqmkWggWOOQQQQaRRRQQJ",
"ffbYKLJILYYKKKAKZZKo2t222000ymmmmkjggkkgggggggjknjhjjhhVhhjjjjhhhhhghXhhhhjhjjggUOOTjgjlhhXhjkjkkkkkiiiidUUUUSOOPW15141wmmmmmmidikWOMMQUaQRRRRR",
"bbbZZbeLLKLLLKDLLKZ222220000yqmmmkkkjljggggjkllnwwjljkllnXjjjjhhXXXghjjjjggVXhhgTPOOXXhnlXNhlkkkkkkkkkiiiiiWUUSOSW5754wkkmmmmmmiiikWPMQUQUQRLRR",
"ZZbZZbcYYCLKKDDDADe2t22200000yrmmmmjmnllkggggkxzxzxnjjlnnllXXhXVNHPVXhjghgTESXVgXSPPVXVXljhjlkllkkkkkiiiiiiiWUSSUW554wnlkmmimmmiiimkTOMQQQOQRLL",
"KYZbfsoRRLJKZZKKAAo200220000yywrrrmnwgUUUSOOOOUnzzzxlnwlhhhOMVXVNFEHSXjWWhTGThghVSPNNVSVlnllllllkkkkkiikiiiigWUUUg554wwnkkmimmmmmmmmWOOOOOMNURL",
"eRLZsvvcaRLLZZZKLJt2002200tyyyyqqyykUPPPPOOMOOOPl15znnXVVXjVHFPXVFFBNXjjjjjhXXXhXVNEEHNPhhlnljWXkkkkkkkkkmmkigUWgm554wwwmkmimmmnmmmkkOOMEHNNQaY",
"sYLevvoQQLLLLZZbaa00002210qyyyxy0ygWWWSOOOMMMMMOWl55xwXMHSXXNENXPHGPVhjjjjjhVPSVXVPNEFENXjjhXXTUjkgWkkkkmmmmkkggin554wwwnmmmimmnmmmmkUHMEFMOQRa",
"eLKsvvvocQKRLLbaRRt0044040qqqy12ykgkkgPOOMMMMMMMOgzzzzwXFFPXNBPVMGPXXhlljXXhVFENSVSPEFNVhjjhVSXhhkWUkkkkkmmmkkggmx541xrwwnnmmimmmmmnkgMMGGGMQRR",
"vvsvvvsspQJeQALYDDt0014011qqq22ymkkggUPOOOMGGGHMHSw55rrhNEOhXPVMENPNVXhlnVThXNEEPXhSFFSVVXhhhXhVSTVjllkmmkmmmkkmmy541xwnwnnnmmmmmmmnmkWMOGEJQRR",
"v33vvvuseRRaJKJRDDt00144140q020qmkggWSPOOOMGGEGGMMg55zhXXFNXVSNBEEEBGSXhjlhhVHHNXhhPEHVNFNVXVhjgVPShjkklmmmmlmwnq4541xxxnnnnnmmmmmrnmmkUOMAMQRI",
"v33vvveQaooTRRJIIDp00141441y22wmkgggWSPOOMMMGGEEHMTxzlNNXVNHFFFNPSHEEHXjjnnhPFHVhjXNNNNFFFFVhhlWhhWSXlllmnnnmz1xq5544xxxwwrnnnmmmnwnmmmUMHGMRIB",
"uv3vuvbLv3voooaIIAc1024232y02yqmkkggWSOOOOMMHHGEHMOzzhSFMHHNNFHXXXHFNVjnnnnVHEPXXXSNPMEHEEFSjlnnlhhXShknwnwwx41zy5541zxxxxwwnnmmmwwnnmqgOMOMGEE",
"ffvuevaevvvsocRACAL102232yy2yqqmkkkWSPOPOMMMMHGHHMNXjXVHESXXNEFFHVHBPhnnnnhNFHXXMHFFFHPNFPXhlnnnnlhXPVjwwwwwz55y15411zzxxxxwwnmmmwwnnmmkSOSMBEG",
"DAefeues3vvcceaJCDAt42330y00yyqmkkkWUPOSOMMMMHHHHHHVxjhMFSPHFEFHMNHEVlwrnjSEHVhhSEBFNXPHVXnwnnnnnlhVPhlwxxxyy441eq1111zzxxxxwwwnmwwxmmmiUPPOEBM",
"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",
"opcaaaaaqpcpiddaaQQa0501140yywwrn51ynlnnUPSOMHGGGMOMHEBGGBBBFMFBAABEBBCAAGTWOMGEBQhhhhhXXhhjhjnwlnnnmmWSnxnmmmgSOQAAIDDDAaxrmmmwwqqqwYLYIDADZZZ",
"pocaaeap0ooppdaQQaip02000220ywwwn44yrwnWWSSOOMGEBBGGMMEBAACAEHFFGGGEEEBBCAGOUhWWUGThhUOMGMWhhjljllnnmkWUwwrwwlSMMUJAJQDKLixnmmrwqqwxiKLYKLYLZZZ",
"ooaaaeattoppaQQappci1200001200wwwy50ywkgWUOOOOMMGBBEBGGHGEBABACGOOOMBBFEBGSWllkkkgOXUOUSSGGWhlnlkknnmnkWxxwxykOFMUUQadaKbxnnmmwrqrwxaLYLZbbZLLA",
"ocQQaeetoppcQQaqqpidq4100202000xxw44ynlkgUOOMHGBMOMGBCBEGMGBBEOUgkhgWOHHFPglxlnwnlgVThlghhOOhjxnjlnmnrmkwwwxxgOHOUaaadiKcxmlmmmrrnwqZZZKLZbRGBA",
"ecUOaacqpoaQQcqqqppaR54001010011zx15wmmkkWUUOGGEBGUOGACBBEGGGOWlwnkkklUMPXlxwnwxwwjUlxnmnngWXhzxlllmrwnjlmwxxkOMMUaaiWUdwmmnnnmmqmwoZZZZLLJGGAA",
"eeeaQatppoaactpppqiQGc44020y1y011115ynmkkngVOMMMGBOWOMGGHGEOSgnwxknwmmlXWlwxwwxxxzghxxnwxnlhhjwxnkmnwxrWWkrxwlTOOMqikWOWknwnnmmmmmqYLLZbRGGGIAA",
"eeaeUQpppcaotqpcppiGEBc4004yy11111141wmmwkgWSPPOMGBGOOGEGOOUgnwzwwxxwwzhknwxwwyz1whwxxxxxxnkknrwwnnxzygUUkxxnmTPWH44iUTMTWglmkmqmmiDBIYLGGGGBAC",
"eecRVVTdUQiyqpcccqaBEGDc1114z14414144ynwnkkkggUOOPMOOMMMOWhlnwxzwxxxz4lhnwxx11144lwxxxyyyznllmw4xnz11wgWWkxwmlUWkMy51UWWWUUggkmwmkQCCBIGGGGGGBC",
"eaJGVhSPHFOQipiiidQJKKKDe1144z14445451wxnlkkkgghggkhgghlllnnnwxzzzz15zhnnwzzz111zwxxz1111xwmkmw4zzzzwmmkWgwwkkgxnPy88tiggOMQWkimmWJIICEGGEBIIAA",
"eJETXXSFHHEFdriqriQLLKKDDo114114444554wxwnlllllllnnllllwnnnnwxxzzzz44nwwwxz1z115xxxzz111yxrnmrx14zwnmmmmggxwmklzwg4876tgnUHOUSgkwiICCCGBCACGCAA",
"aRBUXSVPHPNNdppiiqdADKKDDKo01144444455nwxwnnnllllnnllnnnnnnwzzzzzy15wnwwz111115zxxzz111yzxxwxzx41nkmnnrnkgwxmmrxmm5rc76qxggUMMdgwdGBIMMGBBBIAAA",
"eaarjTSVNHSdiipciriJAAADJIIaq111445444nwxzxwnlnnnnnnnnnwxxwxzz11145wnwxy1114155xxz144411mknwz4554wkmnwwwmgxxmkrxllzd12tpngnkTMUSWQIOVVTVSGICAAJ",
"cptytoiXSHNppyqpcdVQJACDIFNHGUq4444445wwxz1zxnnwwwwwnnwxxzzzzz1455xnxxzzz11045xxy114411kggmkklx1nmmrwwwwkg1ymknzlwyl55iRmlkkWPOPUQMIIPPUTMBAAJJ",
"sttpooyqmVdppyppaMHMQCAIJDFMHHUq0110045yz1411ywxxzyxwwwxzz1111455wwxxzzz11045zxyz11101ngkkmmkkmwwrrxxxxxln1xkjwxdcaQUr0c5kggnUOOSOMMAAGPTTGCCDA",
"otttoojiy1mqy4qmUGFHQIADJICABaicciopt005555554wxzz1zzzxzz11z1551wwxxyz111145zxyz11102xkmmmnnnmnx1zzxxwiUUUddQQQIIGCAQd0aUWjgxkWSOOGGECIMTTGCAAC",
"t0qpeizy41rqptrdhPMNQIACIIDCapiimpRRRQIR0451455zzzz14441zzz155zxwxxyz1111151xyz111021nwrrrrnnxqppiaQQICIQQQUUUUQQQDadmySEGgnnmwnUUaQQIICIAAAADD",
"00pacxyz1qppqpcadUEMPJCCDJJapiippaaQJCIAGcq5545541144555445551xxxxxz1111155xyz144124zyyxxxxxqoccpcaRaQQJCCABMQQQPdiymddHTTTilkyxwgUccaQJICCIHEI",
"tyte0qq1pppopmQQddFBHOQDAIcpmiipeRaJACCEFEQUp1445555555555551zxxxwz11110551zyz44115ytoepoppoacqtocpmjXPNMHMHMGEa00ct1z4UVzjOkkznxmSaccccaQRMHNN",
"t0oc2qq1pyz0prQQQOMCBHOQMcrimipeeQQICABFGIQJGc5yz45555555441zz11zzz111155544111142oeeeooooaRptoopqmmdXPHNNUQHT088to71+7zj5zWdizmyzncccaaaRYaMHH",
"ttep2yqyyyyyqrrrdPHFEFENjzmqmpooaJJIBBEEAQQRarq441145544144444555541114555455542toooecoooeeoppqyrqqjXVVWdpQNi7782to2q85zzjT17ywmyyqcaaaRRRYRQHN",
"poe24yypopyrrrqmddOOFAGizmipmoeoQJIBBBBAJQQQmyqqt4555544zz1444444555575445542ooeeotcaceabettopoccpcaaap0dVi58789+8004t55jTT5772ixxoaaaccaYYaaTN",
"eeot00yco0xrqryqqpmcRIryqmpqpeeaJDCBEBBCQQJcrqoeot15558755551zz1457752t002toeotppycaaccee02ppcccaaaeotqdd48977885jj58588xzrq515qyqcaaeecaaeocdU",
"eeott41pqrryyyyyqaccdxxrxqtpaaaQBAABIJBJQQJcpoeety1458+99760455555toccaoooottpy5riccooeattopcpcacco2yrmy88888758558/+//55xXOa4mqypaccccccccaQaa",
"eettt04rqcpqyqyrypcdz4rytspceQGBBCBQaQJQQDKpttpyp25579++960qiy0ttocoptt1410qqirqpipppeapoaccpqqqt241rq5++89+98/8279+/+/7yrTQHp70qoaRaacccUSVUaa",
"eott4110ooyyypoppciz5ytsspceQGBBBGQaRQaRJaq41yryt155++89955qttoppooopt42tyyicmqopcpqcct2t00011z5xlxx48//+89++98t2+99+9/+rmiiUBc4meecaRaaUPPVicR",
"estt0000potypccppmz1tssspcaJBBBGGMQQQQIJy5410ty15x5++824555tttpoooos200t1zz1zzoccopict5541tyzz54xjz59973tt336tt8/979++++r16qUJIUmRRaeaaaPNNNaea",
"aottet0ytoooooprr4tsssstcRCBCAEMGIQQQCIy1y11ts45454562yy41pppoeeot254pp115555oecopict44tt24667555799733ttt26268+9778++585x+/5dca0qdUacaPPONQaaa",
"aotoeo10qttt01xytssssoooKAAACAGGIJQQICr4144tst0yy55268/42toooospt44zpt55zyy5teccppc0888++//////+++999889++632987/75487q75z5/511rd24cUidVWUaRaef",
"cctoeettot011yqpcooeopcLKLKADIECAQRKIpytsotst0t65+/8+/6tssooottttt1105zrrpqpeeeoect/////////++998889999+86667/89+75r4qt645r07485QattJJUjjddUYbf",
"eaptoot0011tpocJMcaccaRLZZZDACBBDQLKRcoeeeccpt6//+9982toosstt41y4550y111ypoeeeoee2/////+99999+++999889+979+//27+86755j0714zd87ttiMUptIIUjjddgRZ",
"eaotootttpoccaaaacccaLDLZZZKADAAJRQQccecccoocco22tstsoooottt4555540ty155tooooooe3///+888889+//++99999/++9+77t2/626227rm45y4j+/8adaFUqoIBQgddjjQ",
"eacoeeeeeecccccccccJDLYZLJKKJKDIGGJcocpiiiiiccppcceeeeeecopoooottpt1155tootoooe2//+99999+///+9/+99/+989986666666tpp2/8yr541y69+70iQjPVaBIQUdiii",
"aaacoeeeeocacccaooKADIKLLJKLRaaaaaccccUQUUdiqy1yptoeeeeccoppppocacccopcocceeoo7//++++++////+98+99899972+7887+98ot7pp8+851114q7870qU6yTSOQQQaaii",
"aaaaeeeoocaaaaaccLZKAAACRJAAaaaticciidUTrzz511441ypooocccpppptttoocaocacceot69/++///+///+/+9/+678788+/67862678+6396p2+975114di77pcdp+6iTNPNaaac",
"eaaaceecaacaaaceZZZKDKKADCAKcQppccccUUxzqmmrpyy00tppcccceeooppooooccpttt644+////+++9878+/+88//9898989996/6t36tt66863t8/638yymNq86adQ0630TMPUUQQ",
"feMQaaaaacaaacebbbLZZZLDCKDecoticcddcp0qUWjioqmipottttooooeooppttt0624++417/+/+//+99+8208+98++/899+968+68+6tpcccttt332+8670rxTd892cca4662iaQTNM",
"RbbRRaaccaaaabbfQPZZfZKLLYYoottccixiUjrrrzppicpmcoco0042ttt14554rry1557yj7/+++++//+989965547+9+9899+768738+8tccco22p338+96q1zrg29+2cQ02v662dHTQ",
"BRbbboQQQacQFRbbabffbZbLLLototpiiqlNEMVWiyz1yy1yott40typt550155lnxy14ycq/////////+//9898251n15+/79997t6+32+983263696pt6+891m15Ud+796dc6oov36pUd",
"CEJYf3aJcsoQQRbbffffbZbKKKeootqqphVFEAFVy14415555tttt0p04155100mrxzypp5/////////++///99//85415m5+89993t98379866998897tt8894d45jm88881Q23eeev6tT",
"ABEAe3so3veQOQJKbfbbffZZZYeeoyriXVNFHHXx14tt1540toep5414517512dcqqpc0+//++/////+89+///89/7+/54WPp68997p6/33898669998886t2871115++988pJ273eeactt",
"BBGCevvv3soQQOQRbaVaffZZZZetqydSVVEAMhr1yy0tqoooctyzyy5144000iUcco28/+///+99++//+++///+7++7/+rjOFQ089833/6369866899988882t99779+9+96pIc663eeaao",
"QHMHav3vvsvvooceYbaffbbYeeppppiddPFOUdpptpptppptq00pp0451100paQc28///99+///+999++988//987/+79786rWNd68739936888669989988923/766+8892qQJs63seaab",
"JDIOHaeYbs3vseaaYYbeecpppq1q0yytoQdqqttsttqq0027++74466tosocac28+/+///989+////+999+++/+88+/88+8/+5rNO0866/636997669989987862yp2+8670qcIR36toeae",
"LJCDGIDAAbvveRbaecppttt00ytp04yosptttssptqMp0788/858/6sefecpp6/++++////99999+/+9999+/++78//+7++++55yjUp76+9638997689789+76yUHd37+372piGGp62ooeb",
"YYDACDKKAAeoaeoossssottt0ytt01100tsssot0tdd55++8+8++2oesottt2/+++999///+99999+9889/6+/+78+//78++/5157rdq69986699976987885UEEM132+362piQGa23teoe",
"YYDDLKKLRaosvvsssooootttttt0tt02sssst2201z57////+/+sooopptop+//+88878///99999+9999+/7++788//+78++445545ic7+8867999669677rFAAT56p+86tppdMJt33oeo",
"KDDYbeosvvvvssstooootttsooeopttsssst20yxz41/+8+/87sotpttoos8//+85qii47++/99999+++/+/8687889//868+8557557rd6+86689996776rNBAAi0+25/60ttpaJp33paR",
"LDDessvsssssssssooottsoeeos222tpptt2pdqq14875//86pt222too3+//++0OHHFPdyz5+9++99889//+776788+//858++785587yd6+7679999660dpicat38+6+622ttpct2pUMF",
"bessssoosssvsssooossoeoosstqjpppq00cBQy155718/6tt01tttpt8///++90OEHBEHVj5/+99999888//7367988///76885845741zi4+7789998666776233286+602ttiUyiPEBB",
"sssssoaosvvsssooosseossvvstVNTpt00cCJp01z75582t21ytpqir5/++++9974VHAFi678//999999989/+3369988///768++45+8775mt867889986788833336992tttqdQPNHBCB",
"ssssssosvscssooossssvvvvstqNHHdttqJay4t45+72tt21yz15jj4++/+++99875ydd68999++999899989/6337998////67++74877/51ip68779997799963636874ppigOBBEEBAE",
"sssosssssscosoossssvsssssttpaUpt0cot5248982ttt1t1455rj+/++++999+88877899988++88899999/93338+9+//+867+6qi155811mc7888999768+73776887tiWPFAABBAAF",
"sooossddptoossssosvstooo333sot204ot0458872ttot1y455515/+++++99/98++9999993369+779999++/63638+9//7/80576y55x175rdi788999867986787675pXSFBCBBCABN",
"ooosvsPHNUcsstooottpaQo3333sot242tt547+7tttot0y115104//+++++9+/99++999999tt3389889989+/9366389+/7+/707777757472xdt9889987798667865rTNHBCBBBBBEN",
"sssssoaHOdostpacpppQAQt3v3sost55tt255792ttpt0ty154r1+/++++++9++99+9+++996333337998989+//6363389/+9//427564477770zr098898988966666mPEBABEEEEEEBE",
"YLKKLaoccsccdTEHUdUMGctvvvsos0522454482ptt2ytt4111z7/++++++9/++9++++++9733333369+87999+/+333339/+9//+467+7z4577711r2988888896662mOBAAABHHEBBBBB",
"AAAAAARRUiWPSSPPTccppttvvsoot551455426tt2t04tt42yr5//++++++++++97679998333vt33369966999+/83333t7+8+//+26874++1d0411m28888889666pOBAAAABHHEBBBBE",
"BCAACEGFHVXXVSFEGMitvttppooo155445522ot2tt55000py7//++++++++9/+63336776333tt333669933897//6333aQ589///715855+7rr474jT2888888730QBBEEEEEHNMHEEEF",
"EBABGGEEBFOdWMABAGpvvttdNQUq55545542tt2tt25501q28//+9++++++8+/83336666333ttt33363896s3938/+333pBN58+///5488415z4144mdi68888872dFHPTTTVTSVXVPMHN",
"RGEEGRJRIBEJBGCAFctsvstcHHPXz444452vo22tt0110r5///+9+++++++9++6633366633ttt3333333993v336//633taGr8+////547855x5545yxyq787447tOHWjkjggjgdhjjdUT",
"RRJJJRRRJACEBIGAQosvsvscMFHNhy254vvottttt00055////99++++++99/966333366333v333333636973333///6333t6/++///+5579+7yy14yyxjt87rr5qPUikmyjdjljgjjjjj",
"bYYRRYRRJCABABQaossssvseaMPTSd42vvtototttz4408///99++++++999+86633333333333333336638963339//936736//+/+//7x4897yq6410yydt7664iWddky4rdjnrdddSVm",
"bbYRRYYJIBJKILsssssssvooopyzxy3sv2pptot011510///+99++++++999+66663333333333333336836983336/++836768/++++//1r57877887yinri297yddddq665ijjldUWTW2",
"bbbRRYbRJEJYYsvssssssseost224tss3tcttot11y4y7//+99++++9+999996666333t333333333t36833796336+9+973766+++++//8z45877998424pip77qddmy2668tihXWdhjt6"
];
let STEP = 4;
let RR = [], GG = [], BB = [], LUM = [], SOFT = [];
let DR = [], DG = [], DB = [];
let pg;
let paintRow = 0, baseRow = 0;
let flyers = [];
let sparks = [];
let offX, offY, active = new Set();
const PAPER = [244, 238, 224];

function setup() {
  createCanvas(COLS * CELL, ROWS * CELL);
  pg = createGraphics(width, height);
  pg.noStroke();
  pg.background(PAPER[0], PAPER[1], PAPER[2]);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let h = PAL[CH.indexOf(DOTS[y][x])];
      let r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      RR.push(r); GG.push(g); BB.push(b); LUM.push(luma(r, g, b));
    }
  }
  SOFT = boxBlur(boxBlur(LUM, 3), 3);
  for (let i = 0; i < COLS * ROWS; i++) {
    let c = matchL([RR[i], GG[i], BB[i]], toneAt(i));
    DR.push(c[0]); DG.push(c[1]); DB.push(c[2]);
  }
  offX = new Float32Array(COLS * ROWS);
  offY = new Float32Array(COLS * ROWS);
  makeFlyers();
  makeSparks();
  randomSeed(5);
}

function makeFlyers() {
  for (let k = 0; k < 2600; k++) {
    let i = floor(random(COLS * ROWS));
    let a = random(TWO_PI), r = random(width * 0.6, width * 1.1);
    flyers.push({ i: i, sx: width / 2 + cos(a) * r, sy: height / 2 + sin(a) * r, delay: random(0, 50) });
  }
}

function makeSparks() {
  let cand = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    if (LUM[i] > 185 && RR[i] - BB[i] > 45) cand.push(i);
  }
  for (let k = 0; k < 240 && cand.length > 0; k++) {
    sparks.push({ i: random(cand), p: random(TWO_PI), sp: random(1.2, 3), sz: random(4, 10) });
  }
}

function luma(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function boxBlur(src, rad) {
  let tmp = [], out = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let s = 0, n = 0;
      for (let k = -rad; k <= rad; k++) {
        let xx = x + k;
        if (xx >= 0 && xx < COLS) { s += src[y * COLS + xx]; n++; }
      }
      tmp.push(s / n);
    }
  }
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let s = 0, n = 0;
      for (let k = -rad; k <= rad; k++) {
        let yy = y + k;
        if (yy >= 0 && yy < ROWS) { s += tmp[yy * COLS + x]; n++; }
      }
      out.push(s / n);
    }
  }
  return out;
}

function matchL(c, t) {
  let d = t - luma(c[0], c[1], c[2]);
  return [constrain(c[0] + d, 0, 255), constrain(c[1] + d, 0, 255), constrain(c[2] + d, 0, 255)];
}

function shiftHue(c, amt) {
  let r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  let mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx == r) h = ((g - b) / d) % 6;
    else if (mx == g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + amt + 720) % 360;
  let s = mx == 0 ? 0 : d / mx, v = mx;
  let k = (n) => (n + h / 60) % 6;
  let f = (n) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}

function putDot(c, x, y, d, a) {
  pg.fill(c[0], c[1], c[2], a);
  pg.circle(x, y, d);
}

function cellX(i) { return (i % COLS + 0.5) * CELL; }
function cellY(i) { return (floor(i / COLS) + 0.5) * CELL; }

function draw() {
  paintSome();
  let t = millis() / 1000;
  background(PAPER[0], PAPER[1], PAPER[2]);
  let intro = constrain((frameCount - 40) / 110, 0, 1);
  push();
  let s = 1.015 + 0.007 * sin(t * 1.1);
  translate(width / 2, height / 2 + 3 * sin(t * 0.8));
  scale(s);
  translate(-width / 2, -height / 2);
  if (intro < 1) tint(255, 255 * intro * intro);
  image(pg, 0, 0);
  noTint();
  if (frameCount < 190) drawFlyers(intro);
  if (intro >= 1) scatter(s);
  drawSparks(t, intro);
  pop();
}

function paintSome() {
  for (let k = 0; k < 6 && paintRow < ROWS; k++) {
    while (baseRow < ROWS && baseRow <= paintRow + 2) {
      drawBaseRow(baseRow);
      baseRow++;
    }
    for (let x = 0; x < COLS; x++) paintCell(x, paintRow);
    paintRow++;
  }
}

function drawFlyers(intro) {
  noStroke();
  let fade = 1 - constrain((frameCount - 150) / 40, 0, 1);
  for (let f of flyers) {
    let k = constrain((frameCount - f.delay) / 100, 0, 1);
    let e = 1 - pow(1 - k, 3);
    let x = lerp(f.sx, cellX(f.i), e);
    let y = lerp(f.sy, cellY(f.i), e);
    fill(DR[f.i], DG[f.i], DB[f.i], 255 * fade);
    circle(x, y, CELL * (2.2 - e));
  }
}

function scatter(s) {
  let mx = (mouseX - width / 2) / s + width / 2;
  let my = (mouseY - height / 2) / s + height / 2;
  let R = 60;
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let cx = floor(mx / CELL), cy = floor(my / CELL), cr = ceil(R / CELL);
    for (let y = max(0, cy - cr); y <= min(ROWS - 1, cy + cr); y++) {
      for (let x = max(0, cx - cr); x <= min(COLS - 1, cx + cr); x++) {
        let i = y * COLS + x;
        let dx = cellX(i) - mx, dy = cellY(i) - my;
        let d = sqrt(dx * dx + dy * dy);
        if (d < R && d > 0.01) {
          let push = (1 - d / R) * 3.2;
          offX[i] += dx / d * push;
          offY[i] += dy / d * push;
          active.add(i);
        }
      }
    }
  }
  noStroke();
  fill(PAPER[0], PAPER[1], PAPER[2]);
  for (let i of active) {
    rect(cellX(i) - CELL * 0.75, cellY(i) - CELL * 0.75, CELL * 1.5, CELL * 1.5);
  }
  for (let i of active) {
    offX[i] *= 0.9;
    offY[i] *= 0.9;
    let x = cellX(i) + offX[i], y = cellY(i) + offY[i];
    fill(DR[i], DG[i], DB[i]);
    circle(x, y, CELL * 1.35);
    if (abs(offX[i]) + abs(offY[i]) < 0.15) {
      offX[i] = 0;
      offY[i] = 0;
      active.delete(i);
    }
  }
}

function drawSparks(t, intro) {
  blendMode(ADD);
  noStroke();
  for (let p of sparks) {
    let b = pow(max(0, sin(t * p.sp + p.p)), 8) * intro;
    if (b < 0.02) continue;
    let x = cellX(p.i) + offX[p.i], y = cellY(p.i) + offY[p.i];
    let k = p.sz * (0.5 + b);
    fill(255, 225, 150, 70 * b);
    circle(x, y, k * 1.4);
    fill(255, 250, 225, 230 * b);
    quad(x - k, y, x, y - k * 0.18, x + k, y, x, y + k * 0.18);
    quad(x, y - k, x + k * 0.18, y, x, y + k, x - k * 0.18, y);
  }
  blendMode(BLEND);
}

function drawBaseRow(y) {
  for (let x = 0; x < COLS; x++) {
    let i = y * COLS + x;
    pg.fill(DR[i], DG[i], DB[i]);
    pg.rect(x * CELL, y * CELL, CELL, CELL);
  }
}

function toneAt(i) {
  if (STEP < 3) return LUM[i];
  return constrain(LUM[i] + 0.9 * (LUM[i] - SOFT[i]), 0, 255);
}

function paintCell(x, y) {
  let i = y * COLS + x;
  let orig = [RR[i], GG[i], BB[i]];
  let t = toneAt(i);
  let diff = LUM[i] - SOFT[i];
  let sub = 1, d = CELL * 1.2;
  if (STEP >= 4) {
    let detail = constrain(abs(diff) / 25, 0, 1);
    if (detail > 0.45) { sub = 2; d = CELL * 0.7; }
    else if (detail < 0.12) { d = CELL * 1.45; }
  }
  for (let sy = 0; sy < sub; sy++) {
    for (let sx = 0; sx < sub; sx++) {
      let cx = (x + (sx + 0.5) / sub) * CELL + random(-1.3, 1.3) / sub;
      let cy = (y + (sy + 0.5) / sub) * CELL + random(-1.3, 1.3) / sub;
      let main = STEP >= 3 ? matchL(orig, t) : orig;
      putDot(main, cx, cy, d, 255);
      let hued = matchL(shiftHue(orig, random(-14, 14)), t);
      putDot(hued, cx + random(-0.8, 0.8), cy + random(-0.8, 0.8), d * 0.72, 230);
      if (STEP >= 2) {
        let lit = diff > 3 || LUM[i] > 205;
        let shade = diff < -3 || LUM[i] < 95;
        if ((lit || shade) && random() < 0.45) {
          let tc = lit ? [255, 178, 70] : [70, 78, 205];
          putDot(matchL(tc, t), cx + random(-1, 1), cy + random(-1, 1), d * 0.5, 220);
        }
      } else if (random() < 0.25) {
        putDot(matchL(shiftHue(orig, 180), t), cx + random(-1, 1), cy + random(-1, 1), d * 0.45, 200);
      }
    }
  }
}
