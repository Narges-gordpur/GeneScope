export const IUPAC_DNA = {A:1,C:1,G:1,T:1,R:1,Y:1,S:1,W:1,K:1,M:1,B:1,D:1,H:1,V:1,N:1};
export const IUPAC_RNA = {A:1,C:1,G:1,U:1,R:1,Y:1,S:1,W:1,K:1,M:1,B:1,D:1,H:1,V:1,N:1};
export const UNAMBIGUOUS_DNA = new Set(['A','C','G','T']);

export const AA_MASS = {A:71.03711,R:156.10111,N:114.04293,D:115.02694,C:103.00919,E:129.04259,Q:128.05858,G:57.02146,H:137.05891,I:113.08406,L:113.08406,K:128.09496,M:131.04049,F:147.06841,P:97.05276,S:87.03203,T:101.04768,W:186.07931,Y:163.06333,V:99.06841};
export const WATER_MASS = 18.010565;

export const KD_HYDRO = {A:1.8,R:-4.5,N:-3.5,D:-3.5,C:2.5,Q:-3.5,E:-3.5,G:-0.4,H:-3.2,I:4.5,L:3.8,K:-3.9,M:1.9,F:2.8,P:-1.6,S:-0.8,T:-0.7,W:-0.9,Y:-1.3,V:4.2};
export const PKA = {Nterm:7.5,Cterm:3.55,D:4.05,E:4.45,C:9.0,Y:10.0,H:5.98,K:10.0,R:12.0};

// SantaLucia 1998 unified NN: ΔH (kcal/mol), ΔS (cal/(mol·K))
export const NN_PARAMS = {
    'AA':[-7.9,-22.2],'TT':[-7.9,-22.2],'AT':[-7.2,-20.4],'TA':[-7.2,-21.3],
    'CA':[-8.5,-22.7],'TG':[-8.5,-22.7],'GT':[-8.4,-22.4],'AC':[-8.4,-22.4],
    'CT':[-7.8,-21.0],'AG':[-7.8,-21.0],'GA':[-8.2,-22.2],'TC':[-8.2,-22.2],
    'CG':[-10.6,-27.2],'GC':[-9.8,-24.4],'GG':[-8.0,-19.9],'CC':[-8.0,-19.9]
};

export const HUMAN_CODON_FREQ = {TTT:17.6,TTC:20.3,TTA:7.7,TTG:12.9,CTT:13.2,CTC:19.6,CTA:7.2,CTG:39.6,ATT:16.0,ATC:20.8,ATA:7.5,ATG:22.0,GTT:11.0,GTC:14.5,GTA:7.1,GTG:28.1,TCT:15.2,TCC:17.7,TCA:12.2,TCG:4.4,AGT:12.1,AGC:19.5,CCT:17.5,CCC:19.8,CCA:16.9,CCG:6.9,ACT:13.1,ACC:18.9,ACA:15.1,ACG:6.1,GCT:18.4,GCC:27.7,GCA:15.8,GCG:7.4,TAT:12.2,TAC:15.3,TAA:1.0,TAG:0.8,TGA:1.6,CAT:10.9,CAC:15.1,CAA:12.3,CAG:34.2,AAT:17.0,AAC:19.1,AAA:24.4,AAG:31.9,GAT:21.8,GAC:25.1,GAA:29.0,GAG:39.6,TGT:10.6,TGC:12.6,TGG:13.2,CGT:4.5,CGC:10.4,CGA:6.2,CGG:11.4,AGA:12.1,AGG:12.0,GGT:10.8,GGC:22.2,GGA:16.5,GGG:16.5};

export const AA_MAX_CODON_FREQ = (() => {
    const groups = {F:['TTT','TTC'],L:['TTA','TTG','CTT','CTC','CTA','CTG'],I:['ATT','ATC','ATA'],M:['ATG'],V:['GTT','GTC','GTA','GTG'],S:['TCT','TCC','TCA','TCG','AGT','AGC'],P:['CCT','CCC','CCA','CCG'],T:['ACT','ACC','ACA','ACG'],A:['GCT','GCC','GCA','GCG'],Y:['TAT','TAC'],'*':['TAA','TAG','TGA'],H:['CAT','CAC'],Q:['CAA','CAG'],N:['AAT','AAC'],K:['AAA','AAG'],D:['GAT','GAC'],E:['GAA','GAG'],C:['TGT','TGC'],W:['TGG'],R:['CGT','CGC','CGA','CGG','AGA','AGG'],G:['GGT','GGC','GGA','GGG']};
    const out = {};
    for (const [aa, codons] of Object.entries(groups)) out[aa] = Math.max(...codons.map(c => HUMAN_CODON_FREQ[c]));
    return out;
})();

export const IUPAC_INFO = [
    {code:'A',eq:'A',name:'Adenine',comp:'T',cat:'پورین استاندارد'},
    {code:'T',eq:'T',name:'Thymine',comp:'A',cat:'پیریمیدین استاندارد'},
    {code:'C',eq:'C',name:'Cytosine',comp:'G',cat:'پیریمیدین استاندارد'},
    {code:'G',eq:'G',name:'Guanine',comp:'C',cat:'پورین استاندارد'},
    {code:'R',eq:'A/G',name:'Purine',comp:'Y',cat:'دوگانه'},
    {code:'Y',eq:'C/T',name:'Pyrimidine',comp:'R',cat:'دوگانه'},
    {code:'S',eq:'G/C',name:'Strong',comp:'S',cat:'دوگانه'},
    {code:'W',eq:'A/T',name:'Weak',comp:'W',cat:'دوگانه'},
    {code:'K',eq:'G/T',name:'Keto',comp:'M',cat:'دوگانه'},
    {code:'M',eq:'A/C',name:'Amino',comp:'K',cat:'دوگانه'},
    {code:'B',eq:'C/G/T',name:'not-A',comp:'V',cat:'سه‌گانه'},
    {code:'D',eq:'A/G/T',name:'not-C',comp:'H',cat:'سه‌گانه'},
    {code:'H',eq:'A/C/T',name:'not-G',comp:'D',cat:'سه‌گانه'},
    {code:'V',eq:'A/C/G',name:'not-T',comp:'B',cat:'سه‌گانه'},
    {code:'N',eq:'A/C/G/T',name:'Any',comp:'N',cat:'نامعین'}
];

export const GLOSSARY = [
    ['Accession','شناسه یکتای رکورد'],['Alignment','هم‌ترازی توالی'],['Codon','سه نوکلئوتید'],
    ['CpG Island','ناحیه غنی از CG'],['CAI','Codon Adaptation Index'],['Exon','بخش باقی‌مانده در mRNA'],
    ['FASTA','فرمت هدر > '],['GC Content','درصد G+C'],['GC Skew','(G−C)/(G+C)'],
    ['GRAVY','آب‌گریزی میانگین'],['Intron','بخش حذف‌شده'],['IUPAC','استاندارد دژنره'],
    ['K-mer','زیررشته k تایی'],['ORF','Open Reading Frame'],['pI','نقطه ایزوالکتریک'],
    ['Purine','A و G'],['Pyrimidine','C، T، U'],['Reverse Complement','مکمل معکوس 5→3'],
    ['Shannon Entropy','آنتروپی اطلاعاتی'],['Tm','دمای ذوب'],['Wobble','انعطاف موقعیت سوم'],
    ['GRQS','GeneScope Research Quality Score'],['Nearest-Neighbor Tm','روش ترمودینامیکی دقیق‌تر'],
    ['GC Balance','انحراف GC از بازه بهینه']
];