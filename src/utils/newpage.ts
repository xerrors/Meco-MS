import { parseTime } from "./format"


export interface Item {
  title: string;
  date: string;
  permalink: string;
  cover: string;
  tags: string[];
  categories: string;
  abstract?: string;
}

// 解析模板
export const parseTemplates = () => {

  const defaultItem: Item = {
    title: "新建草稿",
    date: parseTime(new Date()),
    permalink: "/draft/",
    cover: "",
    tags: [],
    categories: ""
  }

  const weekPostItems: Item = {
    title: "新建周报",
    date: parseTime(new Date()),
    permalink: "/" + parseTime(new Date(), "{y}-{m}-{d}") + "-week-post/",
    cover: "https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210820175248-imagepng",
    tags: ["周报"],
    categories: "周报",
    abstract: "摘要"
  }

  const parseItems = (items: Item) => {
    var text: string = "---\n"
    let i: string;
    for (i in items) {
      if (typeof (items[i]) == "string") {
        text += i + ": " + items[i] + "\n";
      } else {
        text += i + ": " + "\n- ";
        text += items[i].join("\n- ")
        text += "\n"
      }
    }
    text += "\n---\n"

    // console.log(text)
    return text
  }

  const templates = {
    "default": parseItems(defaultItem),
    "weekpost": parseItems(weekPostItems)
  }

  return templates;

}

// 解析文本
export function praseText(result:string):string {

  const coverPatt = /cover:[ ]*.*/;
  const permalinkPatt = /permalink:[ ]*.*/;
  const titlePatt = /title:[ ]*.*/;

  let temp:any;
  var cover: string = "";
  var permalink: string = "";
  var title: string = "";

  function replace_pun(sta_a: string): string {
    return sta_a.replace(" ", "")
                .replace("'", "")
                .replace('"', '')
  }

  // 提取封面
  temp = coverPatt.exec(result);
  if (temp) {
    cover = replace_pun(String(temp)).slice(6);
  } else {
    cover = "";
  }
  // 提取链接
  temp = permalinkPatt.exec(result);
  if (temp) {
    permalink = replace_pun(String(temp)).slice(10);
  } else {
    console.log("There is something WRONG!");
  }
  // 提取标题
  temp = titlePatt.exec(result);
  if (temp) {
    title = replace_pun(String(temp)).slice(6);
  } else {
    console.log("There is something WRONG!");
  }

  result = result.replace(/---[\s\S]*---/, "");

  result =
    `本文首发于个人博客：[https://xerrors.fun${permalink}](https://xerrors.fun${permalink})\n\n` +
    `欢迎访问更多文章：[https://xerrors.fun](https://xerrors.fun)\n\n---\n\n` +
    `# ${title}\n\n` +
    result;

  if (cover) {
    result = "![封面](" + cover + ")\n\n" + result;
  }
  return result;
}

export const shortcuts = {
  // "加粗": "Cral-A",
  // "斜体": "Cral-I",
  // "a": "Cral-D",
  // "加粗": "Cral-K",
  // "加粗": "Cral-J",
  // "加粗": "Cral-U",
  // "加粗": "Cral-Z",
  // "加粗": "Cral-Y",
  // "加粗": "Cral-M",
}