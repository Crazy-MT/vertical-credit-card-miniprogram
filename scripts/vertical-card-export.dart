import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vertical_credit_card/vertical_credit_card.dart';
import 'dart:math' as math;
import 'package:vertical_credit_card/src/widgets/emv_chip.dart';
import 'package:vertical_credit_card/src/painters/frost_painter.dart';
import 'package:vertical_credit_card/src/painters/security_hologram_painter.dart';
void main() { testWidgets('export original preset backgrounds', (tester) async {
final themes = <String,VerticalCardTheme>{'nubank': CardPresets.nubank,
'wise': CardPresets.wise,
'appleTitanium': CardPresets.appleTitanium,
'amexCenturion': CardPresets.amexCenturion,
'goldPrestige': CardPresets.goldPrestige,
'neonCyan': CardPresets.neonCyan,
'matrixGreen': CardPresets.matrixGreen,
'flutterImpeller': CardPresets.flutterImpeller,
'chromaticFluid': CardPresets.chromaticFluid,
'neoDigital': CardPresets.neoDigital,
'frostedGlass': CardPresets.frostedGlass,
'revolutChromatic': CardPresets.revolutChromatic,
'painterlyGlobe': CardPresets.painterlyGlobe,
'topographicGold': CardPresets.topographicGold,
'carbonStealth': CardPresets.carbonStealth,
'holoInfinite': CardPresets.holoInfinite,
'nequi': CardPresets.nequi,
'bancolombia': CardPresets.bancolombia,
'mercadoPago': CardPresets.mercadoPago,
'heyBanco': CardPresets.heyBanco,
'nubankUltravioleta': CardPresets.nubankUltravioleta,
'bancoInter': CardPresets.bancoInter,
'lemonCash': CardPresets.lemonCash,
'uala': CardPresets.uala,
'n26': CardPresets.n26,
'yape': CardPresets.yape,
'tenpo': CardPresets.tenpo,
'monzoHotCoral': CardPresets.monzoHotCoral,
'robinhoodGold': CardPresets.robinhoodGold,
'cashApp': CardPresets.cashApp,
'skeletonNfc': CardPresets.skeletonNfc,
'bambooEco': CardPresets.bambooEco,
'damascusSteel': CardPresets.damascusSteel,
'whiteCeramic': CardPresets.whiteCeramic,
'cyberPcb': CardPresets.cyberPcb,
'razerChroma': CardPresets.razerChroma,
'ledgerObsidian': CardPresets.ledgerObsidian,
'solanaAurora': CardPresets.solanaAurora,
'alpineHorizon': CardPresets.alpineHorizon,
'worldNavigator': CardPresets.worldNavigator,
'greatWave': CardPresets.greatWave,
'goldenKintsugi': CardPresets.goldenKintsugi,
'cosmosConstellation': CardPresets.cosmosConstellation,
'artDecoGold': CardPresets.artDecoGold,
'solarEclipse': CardPresets.solarEclipse,
'desertDune': CardPresets.desertDune};
final output = Directory(Platform.environment['VERTICAL_CARD_OUTPUT']!);
String color(Color c) { final hex=c.toARGB32().toRadixString(16).padLeft(8,'0'); return '#'+hex.substring(2)+hex.substring(0,2); }
final metadata = <Map<String,dynamic>>[];
final extra = <String,Widget>{
for (final chip in ChipColor.values) 'chip_${chip.name}': SizedBox(width:44,height:34,child:Center(child:EmvChip(chipColor:chip))),
'frost': SizedBox(width:240,height:380.64,child:CustomPaint(painter:FrostOverlayPainter())),
'security': const SizedBox(width:42,height:28,child:CustomPaint(painter:SecurityHologramPainter()))
};
for(final entry in extra.entries) {
final key=GlobalKey();
await tester.pumpWidget(MaterialApp(home:Scaffold(backgroundColor:Colors.transparent,body:Center(child:RepaintBoundary(key:key,child:entry.value)))));
await tester.pump();
await tester.runAsync(() async {
final image=await (key.currentContext!.findRenderObject()! as RenderRepaintBoundary).toImage(pixelRatio:2);
final bytes=await image.toByteData(format:ui.ImageByteFormat.png);
File('${output.path}/${entry.key}.png').writeAsBytesSync(bytes!.buffer.asUint8List());image.dispose();
});
}
final rand=math.Random(1337);
final particles=List.generate(42,(_)=>{'x':rand.nextDouble(),'y':rand.nextDouble(),'optimumX':(rand.nextDouble()*2-1)*0.25,'optimumY':(rand.nextDouble()*2-1)*0.25,'size':1.5+rand.nextDouble()*2.5,'sensitivity':5+rand.nextDouble()*7});
File('${output.parent.path}/glitter.json').writeAsStringSync(jsonEncode(particles));

for (final entry in themes.entries) {
final key=GlobalKey(); final t=entry.value;
await tester.pumpWidget(MaterialApp(home: Scaffold(backgroundColor: Colors.transparent, body: Center(child: RepaintBoundary(key:key,child:SizedBox(width:240,height:380.64,child:Builder(builder:(context)=>t.background.build(context,borderRadius:t.borderRadius,child:const SizedBox.expand()))))))));
await tester.pump(const Duration(milliseconds:100));
final boundary=key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
await tester.runAsync(() async {
final image=await boundary.toImage(pixelRatio:2);
final bytes=await image.toByteData(format:ui.ImageByteFormat.png);
File('${output.path}/${entry.key}.png').writeAsBytesSync(bytes!.buffer.asUint8List()); image.dispose();
});
metadata.add({'id':entry.key,'type':t.type.name,'textColor':color(t.textColor),'secondaryTextColor':color(t.secondaryTextColor),'chipColor':t.chipColor.name,'textFinish':t.textFinish.name,'isHolographic':t.isHolographic,'enableEdgeGlow':t.enableEdgeGlow,'edgeGlowColor':color(t.edgeGlowColor??t.neonColor??Colors.cyan),'enableDiamondDust':t.enableDiamondDust,'enablePaymentPulse':t.enablePaymentPulse,'isRgbChroma':t.isRgbChroma,'continuousEdgeTube':t.continuousEdgeTube,'blur':t.blur});
}
File('${output.parent.path}/presets.json').writeAsStringSync(jsonEncode(metadata));
await tester.pumpWidget(const SizedBox());
}); }
