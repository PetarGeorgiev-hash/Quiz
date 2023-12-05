import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
  const falseA = e.data.falseAnswers;
  const trueA = e.data.trueAnswers || 0;
  const text = `${trueA} / ${Number(falseA) + Number(trueA)}`;
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
  await zipWriter.add("QuizScore.txt", new TextReader(text));
  const blob = await zipWriter.close();
  postMessage(blob);
};
