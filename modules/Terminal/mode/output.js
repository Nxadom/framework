
export async function output(cmd) {
  try {
    cmd.info('info: (cmd.info("hello"))');
    cmd.success('success: (cmd.success("hello"))');
    cmd.error('error: (cmd.error("hello"))');
    cmd.warning('warning: (cmd.warning("hello"))');
    cmd.output('output: (cmd.output("hello")) — plain, no style class');

    cmd.styledOutput('styledOutput: teks biru tebal', {
      color: '#3b82f6',
      fontWeight: '700',
    });

    cmd.json(
      { name: 'Nexa', version: '1.0', features: ['npm', 'raw', 'mode'] },
      { indent: 2, colorize: true },
    );

    cmd.list(
      ['cmd.output(msg)', 'cmd.error(msg)', 'cmd.success(msg)', 'cmd.info(msg)',
       'cmd.warning(msg)', 'cmd.styledOutput(msg, style)', 'cmd.json(data, opts)',
       'cmd.list(arr, cols)', 'cmd.listEnhanced(arr, cols, opts)',
       'cmd.prompt(title, cb)', 'cmd.secret(title, cb)', 'cmd.confirm(title, cb)',
       'cmd.startNewCommand()', 'cmd.stop()', 'cmd.setUsername(name)',
       'cmd.addCommand(name, fn, desc)', 'cmd.run(command)',
       'cmd.container (DOM element)', 'cmd.username (string)'],
      4,
    );

    cmd.listEnhanced(
      ['Output methods',
       '  cmd.output(msg)',
       '  cmd.error(msg)',
       '  cmd.success(msg)',
       '  cmd.info(msg)',
       '  cmd.warning(msg)',
       '  cmd.styledOutput(msg, style)',
       'Input methods',
       '  cmd.prompt(title, cb)',
       '  cmd.secret(title, cb)',
       '  cmd.confirm(title, cb)',
       'Display methods',
       '  cmd.list(arr, cols)',
       '  cmd.listEnhanced(arr, cols, opts)',
       '  cmd.json(data, opts)',
       'Control methods',
       '  cmd.run(command)',
       '  cmd.stop()',
       '  cmd.startNewCommand()',
       '  cmd.setUsername(name)',
       '  cmd.addCommand(name, fn, desc)',
       'Properties',
       '  cmd.container',
       '  cmd.username'],
      1,
      { style: 'tree', highlight: true },
    );
  } catch (error) {
    console.error('❌ mode output failed:', error);
    return null;
  }
}
