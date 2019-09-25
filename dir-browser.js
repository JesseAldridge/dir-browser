const glob = require("glob")
const Path = require("path")
const fs = require("fs")

function main() {
  const path_obj = path_to_obj('/Users/jessealdridge/Dropbox/code_flow')
  const div_html = path_obj_to_div_html(path_obj);
  const out_html = (
    '<html>\n' +
    '<link rel="stylesheet" type="text/css" href="style.css">\n' +
    div_html +
    '</html>\n'
  );

  fs.writeFileSync('out.html', out_html);
}

function path_obj_to_div_html(obj) {
  let excerpt_html = '';
  obj.excerpt_lines.forEach(function(line) {
    excerpt_html += `  <pre class="excerpt-line">${line}</pre>`;
  });

  let children_html = '';
  obj.children.forEach(function(child) {
    const div_text = path_obj_to_div_html(child);
    const indented_lines = [];
    div_text.split('\n').forEach(function(line) {
      indented_lines.push(`  ${line}`);
    });
    children_html += indented_lines.join('\n');
  });

  return (
    '<div class="node">\n' +
    `  <span class="filename">${obj.filename}</span>\n` +
    `${excerpt_html}` +
    `${children_html}` +
    '</div>\n'
  );
}

function path_to_obj(path) {
  const obj = {
    filename: null,
    children: [],
    excerpt_lines: [],
  };

  if(fs.lstatSync(path).isDirectory()) {
    const paths = glob.sync(Path.join(path, "*"));
    paths.forEach(function(path) {
      if(!is_interesting(path))
        return;
      obj.children.push(path_to_obj(path));
    });
  }

  const parts = path.split('/');
  obj.filename = parts[parts.length - 1];
  if(should_show_excerpt(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const content_lines = content.split('\n');
    for(let i_excerpt = 0; i_excerpt < Math.min(10, content_lines.length); i_excerpt++)
      obj.excerpt_lines.push(`  |  ${content_lines[i_excerpt]}`);
    if(content_lines.length > 10)
      obj.excerpt_lines.push(`  |  ${content_lines.length - 10} more lines...`)
  }

  return obj;
}

function ends_with(path, suffix) {
  return path.indexOf(suffix, path.length - suffix.length) !== -1;
}

function should_show_excerpt(path) {
  const extensions = ['.txt', '.py', '.js', '.rb', '.go'];
  for(let i = 0; i < extensions.length; i++) {
    if(ends_with(path, extensions[i]))
      return true;
  }
  return false;
}

function is_interesting(path) {
  return interestingness(path) > 0.5;
}

function interestingness(path) {
  const boring_extensions = ['.sublime-project', '.sublime-workspace']
  for(let i = 0; i < boring_extensions.length; i++) {
    if(ends_with(path, boring_extensions[i]))
      return 0;
  };
  return 1;
}

main();
