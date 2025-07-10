#!/usr/bin/env ruby
#
# Usage:
#   ruby scripts/manage_rake_task_migration.rb lib/tasks/example_auto_test_task.rake hello_world
#
# This script ensures a generic migration file exists, checks if the given rake task is registered,
# and if not, appends it to the migration file. No duplicate entries. Supports multiple commands per task.

require 'fileutils'
require 'time'

MIGRATE_DIR = 'db/migrate'.freeze
GENERIC_MIGRATION_BASENAME = 'add_rake_tasks_for_new_tasks.rb'.freeze
GENERIC_MIGRATION_CLASS = 'AddRakeTasksForNewTasks'.freeze

rake_file, task_name = ARGV
abort 'Usage: ruby scripts/manage_rake_task_migration.rb <rake_file> <task_name>' unless rake_file && task_name

desc = nil
commands = []

# Parse the rake file for desc and all commands
lines = File.readlines(rake_file)
lines.each_with_index do |line, idx|
  if line.strip.start_with?('desc ')
    desc = line.strip.sub(/^desc\s+/, '').gsub(/^['"]|['"]$/, '')
  elsif line =~ /^\s*task\s+#{Regexp.escape(task_name)}\s*:/
    # Look up to 5 lines above for comments with 'rake'
    (1..5).each do |offset|
      l = lines[idx - offset] rescue nil
      if l && l.strip.start_with?('#') && l.include?('rake')
        commands.unshift(l.strip.sub(/^#\s*/, ''))
      end
    end
    break
  end
end

commands = ["bundle exec rake #{File.basename(rake_file, '.rake')}:#{task_name}"] if commands.empty?
desc ||= 'No description'

# Find or create the generic migration file
migration_file = Dir.glob(File.join(MIGRATE_DIR, "*_#{GENERIC_MIGRATION_BASENAME}")).first
unless migration_file
  timestamp = Time.now.strftime('%Y%m%d%H%M%S')
  migration_file = File.join(MIGRATE_DIR, "#{timestamp}_#{GENERIC_MIGRATION_BASENAME}")
  File.open(migration_file, 'w') do |f|
    f.puts '# This File is generated using the RakeTaskRegistrar.'
    f.puts '# What you need to do manually is listed below:'
    f.puts '# 1- Rename the file as you need'
    f.puts '# 2- Adjust the guard clause'
    f.puts '# 3- Adjust the nohup paramter'
    f.puts ''
    f.puts "class #{GENERIC_MIGRATION_CLASS} < ActiveRecord::Migration[6.1]"
    f.puts '  def change'
    f.puts '    tasks = ['
    f.puts '    ]'
    f.puts '    tasks.each do |task|'
    f.puts '      ProductionRakeTask.create(task)'
    f.puts '    end'
    f.puts '  end'
    f.puts 'end'
  end
end

# Check if the task/commands are already registered
migration_content = File.read(migration_file)
new_tasks = []
commands.each do |command|
  next if migration_content.include?(command) || migration_content.include?(task_name)
  
  # Create properly formatted task entry
  new_tasks << "      {\n        rake_command: '#{command}',\n        description:  '#{desc}',\n        comment: 'Auto-generated migration',\n        nohup: false\n      },"
end

if new_tasks.empty?
  puts 'Task already registered in migration file.'
  exit 0
end

# Insert the new task hashes before the closing ']' of the tasks array
lines = File.readlines(migration_file)
tasks_start = lines.find_index { |l| l =~ /^\s*tasks = \[/ }

if tasks_start.nil?
  puts "Error: Could not find 'tasks = [' in migration file"
  exit 1
end

# Find the closing bracket
tasks_end = nil
(tasks_start + 1...lines.length).each do |i|
  if lines[i] =~ /^\s*\]\s*$/
    tasks_end = i
    break
  end
end

if tasks_end.nil?
  puts "Error: Could not find closing ']' for tasks array in migration file"
  exit 1
end

# Insert new tasks before the closing bracket
new_tasks.reverse.each do |task|
  lines.insert(tasks_end, task + "\n")
end

File.write(migration_file, lines.join)
puts "Task(s) registered in migration file: #{migration_file}"
commands.each { |cmd| puts "Task command: #{cmd}" }
puts "Task description: #{desc}"